'use strict'

const redis = require('redis')
const promisfly = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient()

const pexpire = promisfly(redisClient.expire).bind(redisClient) // chuyen doi tu "func" -> "await func"
const setnxAsync = promisfly(redisClient.setnx).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023:${productId}`
    const retryTimes = 10
    const expireTime = 3000 // 3s tam thoi giu lock

    for (let i = 0; i < retryTimes; i++) {
        // tao 1 key tren redis de khoa san pham, thang nao giu duoc thanh toan
        const result = await setnxAsync(key, retryTimes)
        console.log(`[result]::`, result) // = 0 hoac 1
        if (result === 1) {
            // thao tac voi inventory
            const isReversation = await reservationInventory({
                productId,
                quantity,
                cartId
            })

            if (isReversation.modifiedCount) {
                await pexpire(key, expireTime) // dat thoi gian het han cho khoa
                return key
            }
            return null
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50)) // cho 50ms roi thu lai
        }
    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisfly(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}