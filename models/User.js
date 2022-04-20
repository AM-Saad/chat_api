const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
    },
    email: {
        type: String,
    },
    image: String,
    resetToken: String,
    resetTokenExpr: Date,
    signUpToken: String,
    signUpTokenExpr: Date,
    online: Boolean,
    friends: [
        {
            id: { type: Schema.Types.ObjectId, ref: 'User' },
            chatNumber: Number,
        }
    ],
    requests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    panding_requests: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});


module.exports = mongoose.model('User', userSchema);
