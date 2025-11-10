'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')

const convertToObjectIdMongodb = (id) => {
    return new Types.ObjectId(id)
}
const getIntoData = ({ fileds = [], object = {} }) => {
    return _.pick(object, fileds)
}

// ['a', 'b', 'c'] => { a: 1, b: 1, c: 1 }
const getSelectData = (select = []) => {
    return Object.fromEntries(
        select.map(el => [el, 1])
    )
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(
        select.map(el => [el, 0])
    )
}

const removeUndefinedObject = (obj = {}) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] == null) {
            delete obj[key]
        }
    })
    return obj
}

/*
    const a = {
        c: {
            d: 1
        }
    }

    db.collection.updateOne({
        `c.d`: 1
    })
*/

const updateNestedObjectParser = obj => {
    console.log(`[1]::`, obj)
    const final = {}
    Object.keys(obj).forEach( key => {
        console.log(`[3]::`, key)
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const response = updateNestedObjectParser(obj[key])
            Object.keys(response).forEach( a => {
                console.log(`[4]::`, a)
                final[`${key}.${a}`] = response[a]
            })
        } else {
            final[key] = obj[key]
        }
    })
    console.log(`[2]::`, final)
    return final
}



module.exports = {
    getIntoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb
}