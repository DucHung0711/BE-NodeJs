// docker network create kafka-network: network dung de tao mang docker co ten la kafka-network,
// mang nay cho phep cac container giao tiep voi nhau de dang va an toan hon.
// Chung ta can 1 network rieng de cac container Kafka va Zookeeper co the giao tiep voi nhau ma khong bi can tro boi cac container khac tren he thong.

// docker run -d --name kafkaMQ --network kafka-network -p 9093:9092 -e ALLOW_PLAINTEXT_LISTENER=yes -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9093 -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 wurstmeister/kafka:latest

const { Kafka, logLevel } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9093'],
    logLevel: logLevel.NOTHING
})

const producer = kafka.producer()

const runProducer = async () => {
    await producer.connect()
    await producer.send({
        topic: 'test-topic',
        messages: [
            { value: 'Hello KafkaJS user!' },
        ],
    })

    await producer.disconnect()
}

runProducer().catch(console.error)