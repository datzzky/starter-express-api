const mongoose = require("mongoose");
const {Schema} = mongoose;

const TenantSchema = new Schema({
    
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    workPlace:{
        type: String,
    },
    currentAccommodation:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Accommodation'
    }
});

const TenantModel = mongoose.model('Tenant', TenantSchema);
module.exports = TenantModel;