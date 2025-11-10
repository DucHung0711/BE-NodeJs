'use strict'

const { 
    BadRequestError,
    NotFoundError
 } = require('../core/error.response')

const { discount } = require('../models/discount.model')
const { findAllProducts } = require('../models/repositories/product.repo')
const { convertToObjectIdMongodb } = require('../utils')
const { 
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect,
    checkDiscountExits
 } = require('../models/repositories/discount.repo')

/*
    Discount Service
    1 - Generate discount codes [Shop Admin]
    2 - Get discount amount [User]
    3 - Get all discounts code [User / Shop]
    4 - Verify discount code [User]
    5 - Delete discount code [Shop Admin]
    6 - Cancel discount code [User]
*/

class DiscountService {

    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name,
            description, type, value, max_value, max_uses, uses_count, max_uses_per_user, user_used
        } = payload
        // kiem tra
        // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
        //     throw new BadRequestError('Discount code has expried!')
        // }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be before end date!')
        }

        // create index for discount code
        const foundDiscount = await discount.findOne({ 
            discount_code: code, 
            discount_shopId: convertToObjectIdMongodb(shopId) 
        }).lean()

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount code already exists!')
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count || 0,
            discount_users_used: user_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_product_ids: product_ids === 'all' ? [] : product_ids,
            discount_applies_to: applies_to,
            discount_is_active: is_active
        })

        if (!newDiscount) {
            throw new BadRequestError('Create discount code failed!')
        }

        return newDiscount
    }
    
    static async updateDiscountCode() {
        // to do later
    }

    /*
        Get All Discounts Code
     */
    static async getAllDiscountsCodesWithProduct({
        code,
        shopId, 
        userId,
        limit,
        page
    }) {
        // create index for discount code
        const foundDiscounts = await discount.findOne({ 
            discount_code: code, 
            discount_shopId: convertToObjectIdMongodb(shopId) 
        }).lean()

        if (!foundDiscounts || !foundDiscounts.discount_is_active) {
            throw new NotFoundError('Discount code not found!')
        }

        const { discount_applies_to, discount_product_ids } = foundDiscounts
        let products
        if (discount_applies_to === 'all') {
            products = await findAllProducts({ 
                filter: { 
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if (discount_applies_to === 'specific') {
            products = await findAllProducts({ 
                filter: { 
                    _id: {$in: discount_product_ids},
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        return products
    }

    /*
        Get All Discounts Code for Shop
    */
    static async getAllDiscountCodeByShop({
        limit,
        page,
        shopId
    }) {
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })

        return discounts
    }

    /*
        Apply Discount Code
    */
    static async getDiscountAmount({codeId, userId, shopId, products}) {

        const foundDiscount = await checkDiscountExits({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found!')
        }

        const { 
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_start_date,
            discount_end_date,
            discount_type,
            discount_value,
            discount_max_uses_per_user,
            discount_users_used
        } = foundDiscount

        if (!discount_is_active) {
            throw new NotFoundError('Discount code is not active!')
        }

        if (!discount_max_uses || discount_max_uses <= 0) {
            throw new NotFoundError('Discount code has been used up!')
        }

        if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            throw new NotFoundError('Discount code has expried!')
        }

        // check xem cos gia tri toi thieu hay khong
        let totalOrder = 0

        if (discount_min_order_value > 0) {
            // get total
            totalOrder = products.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        }

        if (totalOrder < discount_min_order_value) {
            throw new NotFoundError(`Order must be at least ${discount_min_order_value} to apply this discount code!`)
        }

        if (discount_max_uses_per_user > 0) { // moi user chi dc su dung gioi han 1 lan
            // const { discount_users_used } = foundDiscount
            // check da su dung chua
            const userUsesDiscount = discount_users_used.find(user => user.userId === userId)
            if (userUsesDiscount) {
                // .....
            }
        }

        // check xem discount nay la fiexed_amount hay percentage
        const amount = discount_type === 'fixed_amount'
            ? discount_value
            : (totalOrder * discount_value) / 100

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }

    }

    static async deleteDiscountCode(shopId, codeId) {
        const foundDiscount = await checkDiscountExits({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found!')
        } 

        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        if (!deleted) {
            throw new NotFoundError('Discount code not found or already deleted!')
        }

        return deleted
    }

    static async cancelDiscountCode(codeId, shopId, userId) {
        const foundDiscount = await checkDiscountExits({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError('Discount code not found!')
        } 

        const result = await discount.findOneAndUpdate(
            foundDiscount._id, {
            $pull: {
                discount_users_used: { userId: convertToObjectIdMongodb(userId) }
            },
            $inc: {
                discount_uses_count: -1,
                discount_max_uses: 1
            }
        })

        if (!result) {
            throw new NotFoundError('Cancel discount code failed!')
        }

        return result
        
    }

}

module.exports = DiscountService