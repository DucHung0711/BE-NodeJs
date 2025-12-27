'use strict'

const {
    listNotByUser
} = require('../services/notification.service')
const { SuccessResponse } = require('../core/success.response')

class NotificationController {
    listNotByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'Notifications retrieved successfully!',
            metadata: await listNotByUser(req.query)
        }).send(res)
    }
}

module.exports = new NotificationController()