const mongoose = require('mongoose');

const {Schema} = mongoose;




const MessageSchema = new Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    messageBody:{
        type: String,
    },
},
{
    timestamps: true,
}
);



const ChatSchema = new Schema({
    users:[{
        type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    messages: [MessageSchema],
},
{
    timestamps:true,
});

 const Chat = mongoose.model('Chat', ChatSchema);

 module.exports = Chat;

/*


const myChat = await myChat.find({$and: [
{users: {$elemMatch: {$eq: req.user._id}}}

{users: {$elemMatch: {$eq: reciever.user._id}}}
]})

*/  