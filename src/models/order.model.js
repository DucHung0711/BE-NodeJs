'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema({
    order_userId: {
        type: Number,
        require: true
    },
    order_checkout: {
        type: Object,
        default: {}
    },
    /*
        order_checkout: {
            totalPrice,
            totalApplyDiscount,
            feeShip
        }
     */
    order_shipping: {
        type: Object,
        default: {}
    },
    /**
        street,
        city,
        state,
        country
     */
    order_payment: {
        type: Object,
        default: {}
    },
    order_products: {
        type: Array,
        default: []
    },
    order_trackingNumber: { // di voi nha van chuyen
        type: String,
        default: '#0000118052022'
    },
    order_status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'canceled', 'delivered'],
        default: 'pending'
    }
},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifieOn'
    }
})

module.exports = {
    cart: model(DOCUMENT_NAME, orderSchema)
}