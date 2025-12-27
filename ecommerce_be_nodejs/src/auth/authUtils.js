'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')

// services
const { findByUserId } = require("../services/keyToken.service")

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

// const createTokenPair = async ( payload, publicKey, privateKey ) => {
//     try {
//         // accessToken
//         const accessToken = await JWT.sign( payload, privateKey, {
//             algorithm: 'RS256',
//             expiresIn: '2 days'
//         })

//         const refreshTokenToken = await JWT.sign( payload, privateKey, {
//             algorithm: 'RS256',
//             expiresIn: '2 days'
//         })

//         JWT.verify( accessToken, publicKey, (err, decode) => {
//             if(err){
//                 console.log(`error verify::`, err)
//             }else{
//                 console.log(`decode verify::`, decode)
//             }
//         })

//         return {accessToken, refreshTokenToken}
//     } catch (error) {

//     }
// }

const createTokenPair = async ( payload, publicKey, privateKey ) => {
    try {
        // accessToken
        const accessToken = await JWT.sign( payload, publicKey, {
            // algorithm: 'RS256',
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign( payload, privateKey, {
            // algorithm: 'RS256',
            expiresIn: '2 days'
        })

        JWT.verify( accessToken, publicKey, (err, decode) => {
            if(err){
                console.log(`error verify::`, err)
            }else{
                console.log(`decode verify::`, decode)
            }
        })

        return {accessToken, refreshToken}
    } catch (error) {
        console.log('createTokenPair error:', error)
        return { accessToken: null, refreshToken: null }
    }
}

const authentication = asyncHandler( async (req, res, next) => {
    /*
    1 - check userId missing
    2 - get accessToken
    3 - verify
    4 - check user in db
    5 - check keyStore with this userId
    6 - OK all -> return next()
    */

    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid Request')

    //2 - get accessToken
    // check keystore
    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not found keyStore')

    // verify token
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = JWT.verify( accessToken, keyStore.publicKey )
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
})

const authenticationV2 = asyncHandler( async (req, res, next) => {
    /*
    1 - check userId missing
    2 - get accessToken
    3 - verify
    4 - check user in db
    5 - check keyStore with this userId
    6 - OK all -> return next()
    */

    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid Request')

    //2 - get accessToken
    // check keystore
    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not found keyStore')

    // 3 
    if (req.headers[HEADER.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify( refreshToken, keyStore.privateKey )
            if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }

    // verify token
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = JWT.verify( accessToken, keyStore.publicKey )
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')
        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
        throw error
    }
})

const verifyJWT = async ( token, keySecret ) => {
    return await JWT.verify( token, keySecret )
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
}