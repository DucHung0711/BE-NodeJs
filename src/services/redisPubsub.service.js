const Redis = require('redis');

class RedisPubSubService {
    constructor() {
        this.subscriber = Redis.createClient({ url: 'redis://127.0.0.1:6379' })
        this.publisher = Redis.createClient({ url: 'redis://127.0.0.1:6379' })

        // Handle Redis errors
        this.subscriber.on('error', (err) => {
            console.error('Redis subscriber error:', err);
        });
        this.publisher.on('error', (err) => {
            console.error('Redis publisher error:', err);
        });
    }

    async connect() {
        if (!this.subscriber.isOpen) {
            try {
                console.log('Connecting Redis subscriber...');
                await this.subscriber.connect();
                console.log('Redis subscriber connected!');
            } catch (err) {
                console.error('Error connecting Redis subscriber:', err);
            }
        }
        if (!this.publisher.isOpen) {
            try {
                console.log('Connecting Redis publisher...');
                await this.publisher.connect();
                console.log('Redis publisher connected!');
            } catch (err) {
                console.error('Error connecting Redis publisher:', err);
            }
        }
    }

    async publish(channel, message) {
        await this.connect(); // Ensure Redis client is connected
        if (!this.publisher.isOpen) {
            throw new Error('Redis publisher is not connected.');
        }

        try {
            // node-redis v4 publish returns number of clients that received the message
            const reply = await this.publisher.publish(channel, message);
            return reply;
        } catch (err) {
            console.error('Error publishing message to Redis:', err);
            throw err;
        }
    }

    async subscribe(channel, callback) {
        console.log('Attempting to subscribe with parameters:', { channel, callbackType: typeof callback });

        // Validate channel
        if (typeof channel !== 'string' || !channel.trim()) {
            console.error('Invalid channel. Expected a non-empty string but received:', typeof channel, 'Value:', channel);
            return;
        }

        // Validate callback
        if (typeof callback !== 'function') {
            console.error('Invalid callback. Expected a function but received:', typeof callback, 'Value:', callback);
            return;
        }

        await this.connect(); // Ensure Redis client is connected

        console.log('Checking Redis subscriber state before subscribing:', {
            isOpen: this.subscriber.isOpen,
            isReady: this.subscriber.isReady
        });

        if (!this.subscriber.isOpen || !this.subscriber.isReady) {
            console.error('Redis subscriber is not ready or not connected. Cannot subscribe to channel.');
            return;
        }

        // Use node-redis v4 subscribe API: await subscribe(channel, messageHandler)
        try {
            await this.subscriber.subscribe(channel, (message) => {
                console.log(`Message received on channel ${channel}:`, message);
                try {
                    const parsed = (typeof message === 'string') ? JSON.parse(message) : message;
                    callback(channel, parsed);
                } catch (err) {
                    console.error('Error parsing message or executing callback:', err, '\nRaw message:', message);
                }
            });
            console.log(`Successfully subscribed to channel: '${channel}'`);
        } catch (error) {
            console.error(`Failed to subscribe to channel '${channel}':`, error);
            return;
        }
    }

}

module.exports = new RedisPubSubService()