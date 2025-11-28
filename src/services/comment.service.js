'use strict'

const Comment = require('../models/comment.model')
const { convertToObjectIdMongodb } = require('../utils')

class CommentService {
    static async createComment(
        productId, userId, content, parentId = null
    ) {
        const comment = new Comment({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentId
        })

        let rightValue
        if (!parentId) {

        } else {
            const maxRightValue = await Comment.findOne({
                comment_productId: convertToObjectIdMongodb(productId),
            }, 'comment_right', { sort: (comment_right: -1)})
        }
    }
}
