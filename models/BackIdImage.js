const mongoose = require('mongoose');
const {Schema} = mongoose;

const BackIDSchema = new Schema({
    image:{
        type: String,
    }
});

const BackIDModel = mongoose.model('BackIdImage', BackIDSchema);
module.exports = BackIDModel;