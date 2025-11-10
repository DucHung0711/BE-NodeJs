'use strict'

const AccessService = require("../services/access.services")
const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class AccessController {

    handleRefreshToken = async (req, res, next) => {
        // v1
        // new SuccessResponse({
        //     message: 'Get token success!',
        //     metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
        // }).send(res)

        // v2 fixed
        new SuccessResponse({
            message: 'Get token success!',
            metadata: await AccessService.handleRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout Success!',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

    signup = async (req, res, next) => {
        // try {
        //     console.log(`[P]::signUp::`, req.body)
        //     return res.status(201).json(await AccessService.signUp(req.body))
        // } catch (error) {
        //     next(error)
        // }

        // return res.status(201).json(await AccessService.signUp(req.body))

        new CREATED({
            message: 'Resgiserted OK!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res)
    }
}

module.exports = new AccessController()