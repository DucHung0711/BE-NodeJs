'use strict'

const { 
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const { cart } = require('../models/cart.model')
const { updateProductById } = require('../models/repositories/product.repo')
/*
    Key features:
    - add product to cart [user]
    - reduce product quantity by one [user]
    - increase product quantity by one [user]
    - remove product from cart [user]
    - get user's cart [user]
    - delete user's cart [user]
    - delete cart item [user]
*/

class CartService {

    /// START REPO CART ///
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active' },
        updateOrInsert = {
            $addToSet: { 
                cart_products: product 
            }
        }, options = { upsert: true, new: true }

        const userCart = await cart.findOneAndUpdate(
            query,
            updateOrInsert,
            options
        )

        return userCart
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product
        const query = { 
            cart_userId: userId, 
            'cart_product.productId': productId,
            cart_state: 'active'
        }, updateSet = {
            $inc: { 'cart_product.$.quantity': quantity }
        }, options = { upsert: true, new: true }

        const userCart = await cart.findOneAndUpdate(
            query,
            updateSet,
            options
        )

        return userCart
    }
    /// END REPO CART ///


    static async addToCart({ userId, product = {} }) {
        // check cart exists
        const userCart = await cart.findOne({ cart_userId: userId })
        if (!userCart) {
            return await CartService.createUserCart({ userId, product })
        }

        // neu co gio hang roi nhung chua co san pham
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product]
            return await userCart.save()
        }

        // gio hang ton tai va co san pham nay thi update so luong san pham
        return await CartService.updateUserCartQuantity({ userId, product })
    }

    // update cart
    /*
        shop_order_ids: [
            { 
                shopId, 
                item_products: [
                    { 
                        quantity, 
                        price,
                        shopId,
                        old_quantity,
                        productId
                    } 
                ], 
                version
            }
        ]
    */
}

module.exports = CartService