'use strict'

const { Schema, model } = require('mongoose'); // Erase if already required
const slugify = require('slugify'); // 8.2k (gziped: 3.5k)

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

// Declare the Schema of the Mongo model
var productSchema = new Schema({
    product_name:{ // quan jean cao cap
        type:String,
        required:true,
    },
    product_thumb:{
        type:String,
        required:true
    },
    product_description: String,
    product_slug: String, // quan-jean-cao-cap
    product_price:{
        type:Number,
        required:true
    },
    product_quantity:{
        type: Number,
        required:true
    },
    product_type:{
        type:String,
        required:true,
        enum: ['Electronics', 'Clothing', 'Furniture']
    },
    product_shop:{
        type: Schema.Types.ObjectId, 
        ref: 'Shop'
    },
    product_attributes:{
        type: Schema.Types.Mixed, 
        required: true
    },
    // more
    product_ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.6666 => 46.666 => 47 => 4.7
    },
    product_variations: { type: Array, default: [] },
    isDraft:{
        type: Boolean,
        default: true, 
        index: true,
        select: false
    },
    isPublished:{
        type: Boolean,
        default: false,
        index: true,
        select: false
    },
    product_ratingsQuantity:{
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// create text index for search
productSchema.index({ product_name: 'text', product_description: 'text' })

// document middleware to create product_slug before save to db: run before .save() and .create()
productSchema.pre('save', function(next){
    this.product_slug = slugify(this.product_name, { lower: true });
    next();
});

// define the product type = clothing
const clothingSchema = new Schema({
    brand:{
        type:String,
        required:true,
    },
    size: String,
    material: String,
    product_shop:{
        type: Schema.Types.ObjectId, 
        ref: 'Shop'
    }
}, {
    collection: 'clothes',
    timestamps: true
})

// define the product type = electronics
const electronicsSchema = new Schema({
    manufacturer:{
        type:String,
        required:true,
    },
    model: String,
    color: String,
    product_shop:{
        type: Schema.Types.ObjectId, 
        ref: 'Shop'
    }
}, {
    collection: 'electronics',
    timestamps: true
})

// define the product type = Furniture
const furnitureSchema = new Schema({
    brand:{
        type:String,
        required:true,
    },
    size: String,
    material: String,
    product_shop:{
        type: Schema.Types.ObjectId, 
        ref: 'Shop'
    }
}, {
    collection: 'furnitures',
    timestamps: true
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothing', clothingSchema),
    electronics: model('Electronics', electronicsSchema),
    furniture: model('Furniture', furnitureSchema)
}