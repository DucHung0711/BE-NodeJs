const express = require('express')
const notificationController = require('../../controllers/notification.controller')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

// here not login

router.use(authenticationV2)

router.get('', asyncHandler(notificationController.listNotByUser))

module.exports = router