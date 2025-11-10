'use strict'

const { product, clothing, electronics, furniture} = require('../../models/product.model')
const { Types } = require('mongoose')
const { getSelectData, unGetSelectData } = require('../../utils')

const findAllDraftsForShop = async ({query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const findAllPublishForShop = async ({query, limit, skip}) => {
    return await queryProducts({query, limit, skip})
}

const searchProductsByUser = async ({keySearch}) => {
    const regexSearch = new RegExp(keySearch)
    const result = await product.find({
        isPublished: true,
        $text: { $search: regexSearch },  
    }, {
        score: { $meta: "textScore" }
    }).sort({ score: { $meta: "textScore" } }).lean()
    return result
}

const publishProductByShop = async ({product_shop, product_id}) => {
    // const foundShop = await product.findOne({
    //     product_shop: new Types.ObjectId(product_shop),
    //     _id: new Types.ObjectId(product_id)
    // })
    // if(!foundShop) return null

    // foundShop.isDraft = false
    // foundShop.isPublished = true
    // const { modifiedCount } = await foundShop.update(foundShop)

    // return modifiedCount

    const filter = {
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    }

    const update = {
        $set: {
            isDraft: false,
            isPublished: true,
            updatedAt: new Date()
        }
    }

    const result = await product.updateOne(filter, update)
    return result.modifiedCount || 0
}   

const unPublishProductByShop = async ({product_shop, product_id}) => {
    const filter = {
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    }

    const update = {
        $set: {
            isDraft: true,
            isPublished: false,
            updatedAt: new Date()
        }
    }

    const result = await product.updateOne(filter, update)
    return result.modifiedCount || 0
}

const findAllProducts = async ( {limit, sort, page, filter, select} ) => {
    const skip = (page - 1) * limit
    const sortBy = (sort === 'ctime') ? { _id: -1 } : { _id: 1 }
    const products = await product.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean()

    return products
}

const findProduct = async ({ product_id, unSelect }) => {
    return await product.findById(product_id)
        .select(unGetSelectData(unSelect))
        .lean()
}

const updateProductById = async ({ 
    productId, 
    bodyUpdate, 
    model,
    isNew = true
}) => {
    const result = await model.findByIdAndUpdate(
        productId,
        bodyUpdate,
        { new: isNew }
    )
    return result
}

const queryProducts = async ({query, limit, skip}) => {
    return await product.find(query)
    .populate('product_shop', 'name email -_id')
    .sort({updatedAt: -1})  // sắp xếp theo ngày cập nhật mới nhất
    .limit(limit)
    .skip(skip)
    .lean()
    .exec()
}

const getProductWithAttributes = async ({ product_id, product_type }) => {
    const modelMap = { Clothing: clothing, Electronics: electronics, Furniture: furniture };
    const model = modelMap[product_type];

    const productData = await product.findById(product_id).lean();
    if (!productData) return null;

    const attributes = await model.findOne({ product_id }).lean(); // ✅ đúng nếu đã lưu product_id

    return {
        ...productData,
        product_attributes: attributes || {} // ✅ metadata không còn null
    };
}

module.exports = {
    findAllDraftsForShop,
    publishProductByShop,
    unPublishProductByShop,
    findAllPublishForShop,
    searchProductsByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductWithAttributes
}
