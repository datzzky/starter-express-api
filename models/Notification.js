const mongoose = require("mongoose");
const {Schema} = mongoose;

const NotificationSchema = new Schema({
    
    userReferenceID:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    notificationBody:{
        type: String,
        
    },
    status:{
        type:String,
        default: 'unread'
    }
},
{
    timestamps: true,
}
);

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;