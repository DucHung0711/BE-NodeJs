'use strict'

const { NotFoundError } = require('../core/error.response')
const { comment }  = require('../models/comment.model')
const { convertToObjectIdMongodb } = require('../utils')
const {
    findProduct
} = require('../models/repositories/product.repo')

class CommentService {
    static async createComment({
        productId, userId, content, parentCommentId = null
    }) {
        const commentProduct = new comment({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId
        })

        let rightValue
        if (parentCommentId) {
            // reply comment
            const parentComment = await comment.findById(convertToObjectIdMongodb(parentCommentId))
            if (!parentComment) {
                throw new NotFoundError('Parent comment not found')
            }
            rightValue = parentComment.comment_right

            await comment.updateMany(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                    comment_right: { $gte: rightValue }
                },
                { $inc: { comment_right: 2 } }
            )

            await comment.updateMany(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                    comment_left: { $gt: rightValue }
                },
                { $inc: { comment_left: 2 } }
            )
        } else {
            const maxRightValue = await comment.findOne(
                { comment_productId: convertToObjectIdMongodb(productId) }, 
                'comment_right', 
                { sort: { comment_right: -1 } }
            )

            rightValue = maxRightValue ? maxRightValue.comment_right + 1 : 1

        }

        commentProduct.comment_left = rightValue
        commentProduct.comment_right = rightValue + 1

        await commentProduct.save()
        return commentProduct
    }

    static async getCommentsByParentId({
        productId,
        commentParentId = null,
        limit = 50,
        offset = 0 // skip
    }) {
        if (commentParentId) {
            const parent = await comment.findById(convertToObjectIdMongodb(commentParentId))
            if (!parent) {
                throw new NotFoundError('Parent comment not found')
            }

            const comments = comment.find({
                comment_productId: convertToObjectIdMongodb(productId),
                comment_left: { $gt: parent.comment_left },
                comment_right: { $lte: parent.comment_right }
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1
            }).sort({
                comment_left: 1
            })

            return comments
        }

        const comments = comment.find({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_parentId: commentParentId
        }).select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1
        }).sort({
            comment_left: 1
        })

        return comments
    }

    static async deleteComment({
        commentId,
        productId
    }) {
        // check product exist in database
        const foundProduct = await findProduct(convertToObjectIdMongodb(productId))
        if (!foundProduct) {
            throw new NotFoundError('Product not found')
        }
        // 1. xac vi tri left/right cua comment can xoa
        const comment = await comment.findById(convertToObjectIdMongodb(commentId))
        if (!comment) {
            throw new NotFoundError('Comment not found')
        }

        const leftValue = comment.comment_left
        const rightValue = comment.comment_right

        // 2. tinh width
        const width = rightValue - leftValue + 1

        // 3. xoa comment va cac comment con cua no
        await comment.deleteMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_left: { $gte: leftValue, $lte: rightValue }
        })

        // 4. cap nhat lai left/right cua cac comment con lai
        await comment.updateMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_right: { $gt: rightValue }
        }, {
            $inc: { comment_right: -width }
        })

        await comment.updateMany({
            comment_productId: convertToObjectIdMongodb(productId),
            comment_left: { $gt: rightValue }
        }, {
            $inc: { comment_left: -width }
        })

        return true
    }
}

module.exports = CommentService