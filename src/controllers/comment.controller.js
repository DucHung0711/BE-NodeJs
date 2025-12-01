'use strict'

const {
    createComment,
    getCommentsByParentId,
    deleteComment
} = require('../services/comment.service')
const { SuccessResponse } = require('../core/success.response')

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Comment created successfully!',
            metadata: await createComment(req.body)
        }).send(res)
    }

    deleteComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Comment created successfully!',
            metadata: await deleteComment(req.body)
        }).send(res)
    }

    getCommentsByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Comments retrieved successfully!',
            metadata: await getCommentsByParentId(req.query)
        }).send(res)
    }
}

module.exports = new CommentController()