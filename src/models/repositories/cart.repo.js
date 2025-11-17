'use strict'

const { cart } = require('../cart.model')
const { convertToObjectIdMongodb } = require('../../utils')

const findCartById = async (cartId) => {
    return await cart.findOne({ _id: convertToObjectIdMongodb(cartId), cart_state: 'active' })
}

module.exports = {
    findCartById
}