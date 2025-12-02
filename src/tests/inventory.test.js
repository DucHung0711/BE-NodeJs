const redisPubSubService = require('../services/redisPubsub.service')

class InventoryServiceTest {

    constructor() {
        redisPubSubService.subscribe('purchase_events', (channel, message) => {
            console.log(`Received message on channel ${channel}:`, message);
            console.log('Raw message data before parsing:', message);
            // try {
            //     const parsedMessage = JSON.parse(message);
            //     if (typeof parsedMessage === 'object' && parsedMessage !== null) {
            //         const { productId, quantity } = parsedMessage; // Giả sử message là JSON
            //         InventoryServiceTest.updateInventory(productId, quantity);
            //     } else {
            //         console.error('Parsed message is not a valid object:', parsedMessage);
            //     }
            // } catch (error) {
            //     console.error('Failed to parse message as JSON:', message, error);
            // }
            
            InventoryServiceTest.updateInventory(message);
        })
    }

    static updateInventory({productId, quantity}) {
        console.log(`Update inventory ${productId} with quantity ${quantity}`)
    }

}

module.exports = new InventoryServiceTest()