'use strict'

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')
const { findCartById } = require("../models/repositories/cart.repo")
const { checkProductByServer } = require('../models/repositories/product.repo')
const { getDiscountAmount } = require('./discount.service')
const { order } = require('../models/order.model')
const { acquireLock, releaseLock } = require('./redis.service')
// import { acquireLock, releaseLock } from './redis.service.js'

class CheckoutService {
    /**
        {
            cartId,
            userId,
            shop_order_ids: [
                {
                    shopId,
                    shop_discount: []
                    item_products: [
                        {
                            productId,
                            quantity,
                            price
                        }
                    ]
                },
                {
                    shopId,
                    shop_discount: [
                        {
                            shopId'
                            discountId,
                            codeId
                        }
                    ]
                    item_products: [
                        {
                            productId,
                            quantity: 2,
                            price: 1000
                        }
                    ]
                }
            ],
        }
     */
    static async checkoutReview({
        cartId,
        userId,
        shop_order_ids = []
    }) {
        // chgeck cart
        const foundCart = await findCartById(cartId)
        if (!foundCart) {
            throw new BadRequestError('Cart not found!')
        }

        const checkout_order = {
            totalProce: 0, // tong tien don hang
            freeShip: 0, // phi van chuyen
            totalDiscount: 0, // tong tien giam gia
            totalCheckout: 0, // tong tien thanh toan
        }, shop_order_ids_new = []

        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i]
            // check  product aviliable
            const checkProductServer = await checkProductByServer(item_products)
            if (!checkProductServer[0]) {
                throw new BadRequestError('Product not found in shop order!')
            }

            // tong tien don hang cua shop
            const checkouet_price = checkProductServer.reduce((acc, item_product) => {
                return acc + (item_product.quantity * item_product.price)
            }, 0)

            // tong tien truov khi xu li
            checkout_order.totalProce += checkouet_price

            const item_checkOut = {
                shopId,
                shop_discounts,
                priceRaw: checkouet_price,
                priceApplyDiscount: checkouet_price, // gia sau khi ap dung giam gia
                item_products: checkProductServer
            }

            // neu shop_discount ton tai > 0, chekc co hop le hay khong
            if (shop_discounts.length > 0) {
                // gia su co 1 discount
                // get amount discount
                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })

                // tong cong discount giam gia
                checkout_order.totalDiscount += discount

                // gia sau khi ap dung giam gia
                if (discount > 0) { // neu tien giam gia > 0 moi cap nhat
                    item_checkOut.priceApplyDiscount = checkouet_price - discount
                }
            }

            // tong thanh toan cuoi cung
            checkout_order.totalCheckout += item_checkOut.priceApplyDiscount

            // push vao mang moi
            shop_order_ids_new.push(item_checkOut)

            return {
                shop_order_ids,
                shop_order_ids_new,
                checkout_order
            }
        }
    }

    // order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        // check lai mot lan nua xem vuot ton kho hay khong
        // get new array product
        const product = shop_order_ids_new.flatMap(order => order.item_products)
        console.log(`[1]: `, product)

        for (let i = 0; i < product.length; i++) {
            const { productId, quantity } = product[i]
        }
    }

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        // check lai mot lan nua xem vuot ton kho hay khong
        // get new array product
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log(`[1]: `, products)
        const acquireProduct = []
        for (let i = 0; i < product.length; i++) {
            const { productId, quantity } = product[i]
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        // check neu co san pham het hang trong kho
        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long kiem tra lai gio hang!')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        // truong hop insert thanh cong
        if (newOrder) {
            
        }

        return newOrder
    }

    /*
        1> Query order [Users]
    */
    static async getOrderByUserId() {

    }

    /*
        1> Query order using id [Users]
    */
    static async getOneOrderByUserId() {

    }

    /*
        1> Cancel order [Users]
    */
    static async cancelOrderByUserId() {

    }

    /*
        1> Update order status [Shop | Admin]
    */
    static async updateOrderStatusByShop() {

    }
}

module.exports = CheckoutService