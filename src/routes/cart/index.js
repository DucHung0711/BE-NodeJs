'use strict'

const express = require('express')
const cartController = require('../../controllers/cart.controller')
const router = express.Router()
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

// router.use(authenticationV2)
router.post('', asyncHandler(cartController.addToCart))
router.post('/update', asyncHandler(cartController.update))
router.delete('', asyncHandler(cartController.delete))
router.get('', asyncHandler(cartController.listToCart))

module.exports = router