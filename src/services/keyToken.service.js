'use strict'

const { filter, update } = require("lodash")
const keytokenModel = require("../models/keytoken.model")
const { options } = require("../routes")
const { Types } = require('mongoose')


class KeyTokenService {

    static createKeyToken  = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {

            const filter = { user: userId }
            const update = {
                $set: {
                    publicKey,
                    privateKey,
                    refreshTokensUsed: [],
                    refreshToken
                }
            }
            const options = { upsert: true, new: true }

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
            console.log('KeyToken saved:', tokens)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }

    static findByUserId = async ( userId ) => {
        return await keytokenModel.findOne({ user: new Types.ObjectId(userId) })
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne({ _id: new Types.ObjectId(id) })
    }

    static findByRefreshTokenUsed = async ( refreshToken ) => {
        return await keytokenModel.findOne({ refreshTokensUsed: refreshToken }).lean()
    }

    static findByRefreshToken = async ( refreshToken ) => {
        return await keytokenModel.findOne({ refreshToken })
    }

    static deleteKeyById = async ( userId ) => {
        return await keytokenModel.deleteOne({ user: new Types.ObjectId(userId) })
    }

}

module.exports = KeyTokenService