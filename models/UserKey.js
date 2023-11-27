const mongoose = require("mongoose");
const {Schema} = mongoose;

const UserKeySchema = new Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    secretKey: {
      type: String,
      required: true,
    },
    encryptionKey: {
      type: String,
      required: true,
    },
  });
  const UserKeyModel = mongoose.model('UserKey', UserKeySchema);
module.exports = UserKeyModel;