'use strict'

const { 
    inventory 
} = require('../inventory.model')

const { Types } = require('mongoose')

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

module.exports = {
    insertInventory
}