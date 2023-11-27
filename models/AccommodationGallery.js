const mongoose = require('mongoose');
const {Schema} = mongoose;

const AccommodationGallerySchema = new Schema({
    image:{
        type: String,
    }
});

const AccommodationGalleryModel = mongoose.model('AccommodationGallery', AccommodationGallerySchema)
module.exports = AccommodationGalleryModel;