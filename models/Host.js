const mongoose = require("mongoose");
const {Schema} = mongoose;
const HostSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    accommodations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accommodation'
      }]
    
});

const HostModels = mongoose.model('Host', HostSchema);
module.exports = HostModels;