'use strict'

const mongoose = require('mongoose')
const connectString = 'mongodb://localhost:27017/shopDEV'

const TestSchema = new mongoose.Schema({ name: String })
const Test = mongoose.model('Test', TestSchema)

describe('Connection Mongoose', () => {
    let connection

    beforeAll(async () => {
        connection = await mongoose.connect(connectString)
    })

    // close connection to mongoose
    afterAll(async () => {
        await connection.disconnect()
    })

    it('should connect to mongoose', async () => {
        const user = new Test({ name: 'Hung' })
        await user.save()
        expect(user.isNew).toBe(false)
    })

    it('should save a document to the database', async () => {
        const user = await Test.findOne({ name: 'Hung' })
        expect(user.name).toBeDefined()
        expect(user.name).toBe('Hung')
    })
})