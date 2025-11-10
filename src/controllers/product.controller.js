'use strict'

const ProductService = require('../services/product.service')
const ProductServiceV2 = require('../services/product.service.xxx')
const { SuccessResponse } = require('../core/success.response')

class ProductController {
    // [POST] /products
    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Create new product success',
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body, 
        //         product_shop: req.user.userId  // lấy userId từ token (req.user
        //     })
        // }).send(res)

        new SuccessResponse({
            message: 'Create new product success',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body, 
                product_shop: req.user.userId  // lấy userId từ token (req.user
            })
        }).send(res)
    }

    // update product
    updateProduct = async (req, res, next) => {
        console.log('DEBUG updateProduct - req.body:', req.body)
        new SuccessResponse({
            message: 'Update product success',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.product_id, {
                ...req.body,
                product_shop: req.user.userId  // lấy userId từ token (req.user
            })
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'publishProductByShop success',
            metadata: await ProductServiceV2.publishProductByShop( {
                product_id: req.params.id, 
                product_shop: req.user.userId  // lấy userId từ token (req.user
            })
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'publishProductByShop success',
            metadata: await ProductServiceV2.publishProductByShop( {
                product_id: req.params.id, 
                product_shop: req.user.userId  // lấy userId từ token (req.user
            })
        }).send(res)
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'unPublishProductByShop success',
            metadata: await ProductServiceV2.unPublishProductByShop( {
                product_id: req.params.id, 
                product_shop: req.user.userId  // lấy userId từ token (req.user
            })
        }).send(res)
    }

    // QUERY
    /**
     * @desc Get all draft products for shop
     * @param {Number} limit - limit number of products
     * @param {Number} skip - skip number of products
     * @return { JSON }
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all drafts for shop success',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId
                // limit: req.query.limit,
                // skip: req.query.skip
            })
        }).send(res)
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get all publish for shop success',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId
                // limit: req.query.limit,
                // skip: req.query.skip
            })
        }).send(res)
    }
    // END QUERY 

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list getListSearchProduct success',
            metadata: await ProductServiceV2.getListSearchProduct(req.params)
        }).send(res)
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list findAllProducts success',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get findProducts success',
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }
}

module.exports = new ProductController()