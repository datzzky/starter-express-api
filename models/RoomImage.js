const mongoose = require('mongoose');
const {Schema} = mongoose;

const RoomImageSchema = new Schema({
    image:{
        type: String,
    }
});

const RoomImageModel = mongoose.model('RoomImage', RoomImageSchema);
module.exports = RoomImageModel;