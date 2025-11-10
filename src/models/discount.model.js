'use strict'

const { model, Schema, Types } = require('mongoose')

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'

const discountSchema = new Schema({
    discount_name: { type: String, required: true},
    discount_description: { type: String, default: ''},
    discount_type: { type: String, default: 'fixed_amount' // 'percentage', 'fixed_amount'
},
    discount_value: { // 10.000, 10
        type: Number,
        required: true
    },
    discount_code: {
        type: String,
        required: true
    },
    discount_start_date: { // ngay bat dau ap dung
        type: Date,
        required: true
    },
    discount_end_date: { // ngyay ket thuc ap dung
        type: Date,
        required: true
    },
    discount_max_uses: { // so luong discount duoc ap dung
        type: Number,
        required: true
    },
    discount_uses_count: { // so luong discount da duoc ap dung
        type: Number,
        required: true
    },
    discount_users_used: [{ // ai da su dung
        type: Array,
        default: []
    }],
    discount_max_uses_per_user: { // so luong toi da 1 nguoi dung duoc su dung
        type: Number,
        required: true
    },
    discount_min_order_value: { // gia tri don hang toi thieu de ap dung
        type: Number,
        required: true
    },
    discount_shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    discount_is_active: {
        type: Boolean,
        default: true
    },
    discount_applies_to: {
        type: String,
        required: true,
        enum: ['all', 'specific'] // all: toan bo san pham, specific: san pham cu the
    },
    discount_product_ids: {
        type: Array,
        default: []
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

module.exports = {
    discount: model(DOCUMENT_NAME, discountSchema)
}