const express = require('express')
const commentController = require('../../controllers/comment.controller')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

// get amount discount

router.use(authenticationV2)
router.post('', asyncHandler(commentController.createComment))

module.exports = router