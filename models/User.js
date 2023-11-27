const mongoose = require("mongoose");
const {Schema} = mongoose;

const UserSchema = new Schema({
    profilePic:{
        type: String,
        default: null,
    },
    FirstName:{
        type: String,
        required: true,
    },
    LastName:{
        type:String,
        required:true,
    },
    Email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    frontID:{
        type:String,
        default: null,
    },
    backID:{
        type:String,
        default: null,
    },
    address:{
        type: String,
        default:null,
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant'
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host'
    },
    userKey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserKey'
    },
    workingLocation: {
        long:{
            type: Number,
            default: null,
        },
        lat:{
            type: Number,
            default: null,
        },
        place: {
          type: String,
          default: null,
        },
      },
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;