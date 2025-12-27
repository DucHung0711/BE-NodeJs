'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { type } = require("os")
const { format } = require("path")
const { getIntoData } = require("../utils")
const { BadRequestError, ForbiddenError, AuthFailureError } = require('../core/error.response')
const { findByEmail } = require("./shop.services")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /*
        check this token used?
     */
    static handleRefreshToken = async (refreshToken) => { 
        // check xem token nay co bi su dung chua
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        // neu co
        if(foundToken){
            // decode xem may la thang nao
            const { userId, email } = await verifyJWT( refreshToken, foundToken.privateKey )
            console.log({ userId, email })
            // xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something went wrong! Please login again')
        }

        // No, qua ngon
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if(!holderToken){
            throw new AuthFailureError('Shop not registered 1')
        }

        // verify token
        const { userId, email } = await verifyJWT( refreshToken, holderToken.privateKey )
        const foundShop = await findByEmail({ email })
        if(!foundShop) throw new AuthFailureError('Shop not registered 2')

        // create new token
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // da duoc su dung de lay token moi
            }
        })

        return { 
            user,
            tokens
        }   

    }

    static handleRefreshTokenV2 = async ({ keyStore, user, refreshToken = null}) => { 
        const { userId, email } = user;
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something went wrong! Please login again');
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new AuthFailureError('Shop not registered');
        }

        const foundShop = await findByEmail({ email })
        if(!foundShop) throw new AuthFailureError('Shop not registered 2')
        // create new token
        const tokens = await createTokenPair({userId, email}, keyStore.publicKey, keyStore.privateKey)
        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // da duoc su dung de lay token moi
            }
        })
        return { 
            user: { userId, email },
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({ delKey })
        return delKey
    }

    /*
        1 - check email inbds
        2 - match password
        3 - crearte AT vs RT and save
        4 - generate tokens
        5 - get data return login
     */
    static login = async( { email, password, refreshToken = null } ) => {
        //1
        const foundShop = await findByEmail({ email })
        if(!foundShop) throw new BadRequestError('Shop not registered')
        
        // Kiểm tra password truyền vào và password trong DB
        if (!password || !foundShop.password) {
            throw new BadRequestError('Thiếu mật khẩu hoặc tài khoản không hợp lệ')
        }   
        
        //2
        const match = bcrypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureError('Authentication error')

        //3
        // created privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')
        //4 - generate tokens
        const { _id: userId } = foundShop
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)
        console.log('tokens:', tokens)
        await KeyTokenService.createKeyToken({
            userId,
            privateKey, publicKey,
            refreshToken: tokens.refreshToken
        })
        return {
            shop: getIntoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }

    static signUp = async ({name, email, password}) => {
        // try {

            // step 1: check email exists?
            const hodeShope = await shopModel.findOne({ email }).lean()
            if (hodeShope) {
                throw new BadRequestError('Error: Shop already registered!')
            }

            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // created privateKey, publicKey
                // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                // modulusLength: 4096, // độ dài key (bit)
                // publicKeyEncoding: {
                //     type: 'pkcs1',   // "Public Key Cryptography Standards 1"
                //     format: 'pem'
                // },
                // privateKeyEncoding: {
                //     type: 'pkcs1',   // nếu bạn muốn dùng pkcs1, còn mặc định nên dùng pkcs8
                //     format: 'pem'
                // }
                // });

                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')

                console.log({ privateKey, publicKey }) // save collection KeyStore
                
                // const publicKeyString = await KeyTokenService.createKeyToken({
                //     userId: newShop._id,
                //     publicKey
                // })

                // if (!publicKeyString) {
                //     return {
                //         code: 'xxx',
                //         message: 'publicKeyString error'
                //     }
                // }

                // console.log(`publicKeyString::`, publicKeyString)
                // const publicKeyObject = crypto.createPublicKey(publicKeyString)
                // console.log(`publicKeyObject::`, publicKeyObject)

                // created token pair
                // const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyString, privateKey)
                // console.log(`Created Token Success::`, tokens)

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    return {
                        code: 'xxx',
                        message: 'keyStore error'
                    }
                }

                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log(`Created Token Success::`, tokens)

                return {
                    code: 201,
                    metadata: {
                        shop: getIntoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
                        tokens
                    }
                }
            }

            return {
                code: 201,
                metadata: null
            }
        // } catch (error){
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService