// docker pull rabbitmq:3-management : management UI
// docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-
// docker exec -it rabbitmq /bin/bash
// rabbbitmqctl change_password guest new_password

// rabbbitmqctl add_user admin new_password
// rabbbitmqctl set_user_tags admin administrator
// rabbbitmqctl set_permissions -p / admin ".*" ".*" ".*"

const amqp = require('amqplib')
const message = 'Hello RabbitMQ!'

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        const queueName = 'test-topic'

        await channel.assertQueue(queueName, {
            durable: true
        })

        // send messages to consumer channel
        channel.sendToQueue(queueName, Buffer.from(message), {
            persistent: true,
        })
        console.log(" [x] Sent '%s'", message)

        await channel.close()
        await connection.close()
        process.exit(0)
    } catch (error) {
        console.error('Error in RabbitMQ producer:', error)
        process.exit(1)
    }
}

runProducer().catch(console.error)