'use strict'

const { 
    inventory 
} = require('../inventory.model')

const { Types } = require('mongoose')

const {
    convertToObjectIdMongodb
} = require('../../utils')

const insertInventory = async({
    productId, shopId, stock, location = 'unknown'
}) => {
    const newInventory = await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId
    })

    return newInventory
}

const reservationInventory = async({
    productId, quantity, cartId
}) => {
    const query = {
        inven_productId: convertToObjectIdMongodb(productId),
        inven_stock: { $gte: quantity }
    }, updateSet = {
        $inc: {
            inven_stock: -quantity
        },
        $push: {
            inven_reservations: {
                res_cartId: convertToObjectIdMongodb(cartId),
                res_quantity: quantity,
                res_reservedAt: new Date()
            }
        }
    }, options = { upsert: true, new: true }

    return await inventory.updateOne(
        query,
        updateSet
    )
}

module.exports = {
    insertInventory
}