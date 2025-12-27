'use strict'

const amqp = require('amqplib')

const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost')
        if (!connection) throw new Error('Failed to connect to RabbitMQ')

        const channel = await connection.createChannel()
        // const queue = 'shop_queue'
        // channel.assertQueue(queue, { durable: true })
        // console.log('Waiting for messages in %s. To exit press CTRL+C', queue)
        // channel.consume(queue, (msg) => {
        //     const data = JSON.parse(msg.content.toString())
        //     console.log('Received message:', data)
        // })

        return { channel, connection }
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error)
    }
}

const connectToRabbitMQForTest = async () => {
    try {
        const { channel, connection } = await connectToRabbitMQ()

        const queue = 'shop_queue'
        const message = 'Hello from RabbitMQ'
        await channel.assertQueue(queue, { durable: true })
        channel.sendToQueue(queue, Buffer.from(message))
        console.log('Message sent to queue:', message)

        // Wait a bit to ensure message is sent before closing
        await new Promise(resolve => setTimeout(resolve, 100))

        // close connection
        await connection.close()

        return true
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error)
        throw error
    }
}

const consumerQueue = async (channel, queueName) => {
    try {
        channel.assertQueue(queueName, { durable: true }) // durable: server will not delete queue when server restart
        console.log('Waiting for messages....')
        channel.consume(queueName, (msg) => {
            let data
            try {
                // Try to parse as JSON first
                data = JSON.parse(msg.content.toString())
            } catch (error) {
                // If not JSON, treat as plain text
                data = msg.content.toString()
            }
            console.log(`Received message: ${queueName}`, data)
            // 1. find User following taht Shop
            // 2. send notification to User
            // 3. yes, ok ===> success
            // 4. error. setup DLX....
        }, {
            noAck: true // nhan roi thi k gui lai nua
        })
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error)
        throw error
    }
}

module.exports = {
    connectToRabbitMQ,
    connectToRabbitMQForTest,
    consumerQueue
}
