const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const autoIncrement = require('mongoose-auto-increment');
const connection = mongoose.createConnection(`mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/carryit`);
autoIncrement.initialize(connection);


const chatSchema = new Schema({
    chatNumber: Number,
    userone: { type: Schema.Types.ObjectId, ref: 'User' },
    usertwo: { type: Schema.Types.ObjectId, ref: 'User' },
    conversation: [{
        usertype: Number,
        msg: String,
        sender: { type: Schema.Types.ObjectId, ref: 'OnModel' },
        receiver: { type: Schema.Types.ObjectId, ref: 'OnModel' },
        date: { time: String, date: String },
        new_msgs: Number
    }],
    chat_status: { active: { type: Boolean, default: true }, user: { type: Schema.Types.ObjectId, ref: 'OnModel' } }
});

chatSchema.plugin(autoIncrement.plugin, {
    model: 'Chat',
    field: 'chatNumber',
    startAt: 10000,
    incrementBy: 1
});

module.exports = mongoose.model('Chat', chatSchema);
