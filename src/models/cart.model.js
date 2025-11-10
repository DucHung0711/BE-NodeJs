'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

const cartSchema = new Schema({
    cart_state: { 
        type: String, 
        enum: ['active', 'completed', 'failed', 'pending'], 
        default: 'active' },
    cart_products: {
        type: Array,
        require: true,
        default: []
    },
    /*
        [
            { 
                product_id,
                shopId,
                quantity,
                price,
                name
            }
        ]
    */
    cart_count_products: {
        type: Number,
        default: 0
    },
    cart_userId: {
        type: Number,
        ref: 'User'
    }
},{
    collection: COLLECTION_NAME,
    timeseries: {
        createdAt: 'createdOn',
        updatedAt: 'modifieOn'
    }
})

module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}