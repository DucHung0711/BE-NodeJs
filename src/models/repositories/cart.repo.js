'use strict'

const { cart } = require('../cart.model')
const { convertToObjectIdMongodb } = require('../../utils/mongodb.util')

const findCartById = async (cartId) => {
    return await cart.findOne({ _id: convertToObjectIdMongodb(cartId), cart_status: 'active' })
}

module.exports = {
    findCartById
}