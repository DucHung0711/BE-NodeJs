'use strict'

const DiscountService = require('../services/discount.service')
const { SuccessResponse } = require('../core/success.response')

class DiscountController {

    /*
        POST /discounts
    */
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create discount code successfully!',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get discount amount successfully!',
            metadata: await DiscountService.getAllDiscountCodeByShop({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get discount amount successfully!',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }

    getAllDiscountCodesWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get discount amount successfully!',
            metadata: await DiscountService.getAllDiscountsCodesWithProduct({
                ...req.query
            })
        }).send(res)
    }

}

module.exports = new DiscountController()