'use strict'

const { connectToRabbitMQForTest } = require('../dbs/init.rabbit')

describe('Test RabbitMQ', () => {
    it('should connect to RabbitMQ', async () => {
        const result = await connectToRabbitMQForTest()
        expect(result).toBeDefined()
    })
})