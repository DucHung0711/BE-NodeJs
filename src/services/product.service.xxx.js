'use strict'

const { product, clothing, electronics, furniture } = require('../models/product.model')
const { BadRequestError, ForbiddenError } = require('../core/error.response')
const { findAllDraftsForShop,
    publishProductByShop,
    unPublishProductByShop,
    findAllPublishForShop,
    searchProductsByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductWithAttributes
} = require('../models/repositories/product.repo')

const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')

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

    static productRegistry = {}

    static resgisterProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        if (!payload || typeof payload !== 'object') throw new BadRequestError('Missing payload')
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) {
            throw new BadRequestError(`Invalid product type ${type}`)
        }
        return new productClass(payload).createProduct()
    }

    static async updateProduct(type, product_id, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) {
            throw new BadRequestError(`Invalid product type ${type}`)
        }

        return new productClass(payload).updateProduct(product_id)

        // return await getProductWithAttributes({ product_id, product_type: type });
    }

    // PUT
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id })
    }
    // END PUT

    // query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDraftsForShop({ query, limit, skip })
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await findAllPublishForShop({ query, limit, skip })
    }

    static async getListSearchProduct({ keySearch }) {
        return await searchProductsByUser({ keySearch })
    }

    static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
        return await findAllProducts({ limit, sort, page, filter, select: ['product_name', 'product_price', 'product_thumb', 'product_shop'] })
    }

    static async findProduct({ product_id }) {
        return await findProduct({ product_id, unSelect: ['__v', 'product_variations'] })
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
        const newProduct = await product.create({ ...this, _id: product_id })  // nếu product_id undefined thì mongoose sẽ tự tạo id mới
        if (newProduct) {
            // add product_stock in inventory collection
            insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
        }

        return newProduct
    }

    // update product
    async updateProduct(productId, objectParams) {
        return await updateProductById({
            productId,
            bodyUpdate: objectParams,
            model: product
        })
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

    async updateProduct(productId) {
        // remove undefined fields from product_attributes
        // Clean payload: remove undefined fields
        // Loại bỏ field undefined
        const objectParams = removeUndefinedObject(this)
        // Nếu có product_attributes thì update bảng con tương ứng (ví dụ clothing)
        if (objectParams.product_attributes) {
            await updateProductById({
                productId,
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
                model: clothing
            })
        }

        // Update bảng cha product
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))

        return updateProduct;
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
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop  // ensure the electronic item is linked to the correct shop
        })
        if (!newFurniture) throw new BadRequestError('Create new furniture error')

        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) throw new BadRequestError('Create new product error')

        return newProduct
    }
}

// register product types
ProductFactory.resgisterProductType('Clothing', Clothing)
ProductFactory.resgisterProductType('Electronics', Electronics)
ProductFactory.resgisterProductType('Furniture', Furniture)

module.exports = ProductFactory
