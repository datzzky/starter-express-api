const mongoose = require("mongoose");
const {Schema} = mongoose;

const AdminSchema = new Schema({
    userName:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    }
});

const AdminModel = mongoose.model('Admin', AdminSchema);
module.exports = AdminModel;

