const redisPubSubService = require('../services/redisPubsub.service')

class ProductServiceTest {

    async purchaseProduct(productId, quantity) {
        const order = {
            productId,
            quantity
        }
        console.log(`Publishing order:`, order)
        console.log('Preparing to publish message to Redis:', {
            channel: 'purchase_events',
            message: JSON.stringify(order)
        });
        redisPubSubService.publish('purchase_events', JSON.stringify(order))
    }

}

module.exports = new ProductServiceTest()