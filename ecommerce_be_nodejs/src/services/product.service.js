'use strict'

const { product, clothing, electronics} = require('../models/product.model')
const { BadRequestError, ForbiddenError } = require('../core/error.response')

// define Factory class to create product based on type
class ProductFactory {
    /*
        type: 'Clothing', 'Electronics', 'Furniture'
        payload: {
            product_name, product_thumb, product_description,
            product_price, product_quantity, product_type,
            product_shop, product_attributes
        }
    */

    static async createProduct(type, payload) {
        switch (type) {
            case 'Clothing':
                return new Clothing(payload).createProduct()
            case 'Electronics':
                return new Electronics(payload).createProduct()
            default:
                throw new BadRequestError(`Invalid product type ${type}`)
        }
    }   
}

// define base Product class
class Product {
    constructor({
        product_name, product_thumb, product_description,
        product_price, product_quantity, product_type,
        product_shop, product_attributes
    }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    // create new product
    async createProduct(product_id) {
        return await product.create({...this, _id: product_id})  // nếu product_id undefined thì mongoose sẽ tự tạo id mới
    }
}

// define subclass for different product types Clothing
class Clothing extends Product {

    // override createProduct method
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes)
        if (!newClothing) throw new BadRequestError('Create new clothing error')

        const newProduct = await super.createProduct()
        if (!newProduct) throw new BadRequestError('Create new product error')

        return newProduct
    }
}   

// define subclass for different product types Electronics
class Electronics extends Product {

    // override createProduct method
    async createProduct() {
        const newElectronic = await electronics.create({
            ...this.product_attributes,
            product_shop: this.product_shop  // ensure the electronic item is linked to the correct shop
        })
        if (!newElectronic) throw new BadRequestError('Create new electronic error')

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('Create new product error')
            
        return newProduct
    }
}

// define subclass for different product types Furniture
class Furniture extends Product {

    // override createProduct method
    async createProduct() {
        const newElectronic = await electronics.create({
            ...this.product_attributes,
            product_shop: this.product_shop  // ensure the electronic item is linked to the correct shop
        })
        if (!newElectronic) throw new BadRequestError('Create new electronic error')

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('Create new product error')
            
        return newProduct
    }
}

module.exports = ProductFactory
