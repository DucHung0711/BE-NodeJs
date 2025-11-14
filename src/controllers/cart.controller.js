'use strict'

const CartService = require('../services/cart.services')
const { SuccessResponse } = require('../core/success.response')

class CartController {

    /**
     * @description
     * @param {Int} userId 
     * @param {*} res 
     * @param {*} next 
     * @method POST
     * @url /v1/cart/user
     * @returns {}
     */
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Add to cart successfully!',
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }

    // update
    update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update cart successfully!',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }

    // delete
    delete = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete cart item successfully!',
            metadata: await CartService.deleteCartItem(req.body)
        }).send(res)
    }

    // list
    listToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list cart successfully!',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }
}

module.exports = new CartController()