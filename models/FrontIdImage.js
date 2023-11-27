const mongoose = require('mongoose');
const {Schema} = mongoose;

const frontIDSChema = new Schema({
    image:{
        type: String,
    }
});

const frontIDModel = mongoose.model('FrontIdImage', frontIDSChema);
module.exports = frontIDModel;