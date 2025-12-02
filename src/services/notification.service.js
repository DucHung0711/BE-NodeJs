'use strict'

const { NOTI } = require('../models/notification.model')

const pushNotification = async ({
    type = "",
    senderId,
    receivedId,
    options = {}
}) => {
    let noti_content
    if (type === 'ORDER-001') {
        noti_content = 'Your order has been placed successfully!'
    } else if (type === 'ORDER-002') {
        noti_content = 'Your order placement failed. Please try again.'
    } else if (type === 'PROMOTION-001') {
        noti_content = 'New promotion available! Check it out now.'
    } else if (type === 'SHOP-001') {
        noti_content = 'A shop you follow has added a new product.'
    } else {
        noti_content = 'You have a new notification.'
    }

    const newNoti = new NOTI({
        noti_type: type,
        noti_senderId: senderId,
        noti_receivedId: receivedId,
        noti_content,
        noti_options: options
    })

    await newNoti.save()
    return newNoti
}

const listNotByUser = async ({
    userId = 1,
    type = 'All',
    isRead = 0
}) => {
    const match = { noti_receivedId: userId }
    if (type !== 'All') {
        match.noti_type = type
    }
    return await NOTI.aggregate([
        {
            $match: match
        },
        {
            $project: {
                noti_type: 1,
                noti_senderId: 1,
                noti_receivedId: 1,
                noti_content: {
                    $concat: [
                        {
                            $substr: ['$noti_options.product_shop', 0, -1]
                        },
                        ' vua them moi 1 san pham: ', // language
                        {
                            $substr: ['$noti_options.product_name', 0, -1]
                        }
                    ]
                },
                createdAt: 1,
                noti_options: 1
            }
        }
    ])
}

module.exports = {
    pushNotification,
    listNotByUser
}