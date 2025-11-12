'use strict'

const redis = require('redis')
const promisfly = require('util')
const redisClient = redis.createClient()

const pexpire = promisfly.promisify(redisClient.expire).bind(redisClient) // chuyen doi tu "func" -> "await func"
const setnxAsync = promisfly.promisify(redisClient.setnx).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023:${productId}`
    const retryTimes = 10
    const expireTime = 3000 // 3s tam thoi giu lock

    for (let i = 0; i < retryTimes; i++) {
        // tao 1 key tren redis de khoa san pham, thang nao giu duoc thanh toan
        const result = await setnxAsync(key, retryTimes)
        console.log(`[result]::`, result)
        if (result === 1) {
            // thao tac voi inventory

            return key
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50)) // cho 50ms roi thu lai
        }
    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}