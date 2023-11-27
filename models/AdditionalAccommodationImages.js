const mongoose = require('mongoose');
const {Schema} = mongoose;

const AdditionalAccommodationImagesSChema = new Schema({
    image:{
        type: String,
    }
});

const AdditionalAccommodationModel = mongoose.model('AdditionalAccommodationImages', AdditionalAccommodationImagesSChema)
module.exports = AdditionalAccommodationModel;