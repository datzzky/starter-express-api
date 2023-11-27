const mongoose = require('mongoose');
const {Schema} = mongoose;

const ProfileImageSchema = new Schema({
    image:{
        type: String,
    }
});

const ProfileImageModel = mongoose.model('ProfileImage', ProfileImageSchema);
module.exports = ProfileImageModel;