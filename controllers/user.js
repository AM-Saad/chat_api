const User = require("../models/User");
const Chat = require("../models/Chat");



exports.me = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user.id });
        user.online = true
        await user.save()
        return res.status(200).json(user);
    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }


}


exports.update_info = async (req, res, next) => {
    const { email, name } = req.body
    try {
        const user = await User.findOne({ _id: req.user.id })
        if (!user) return res.status(404).json({ message: 'Something went worng, Re-login please', messageType: 'alert' })


        if (!email || !name) return res.status(401).json({ message: 'Email and name are required', messageType: 'alert' })
        const image = req.files[0] ? req.files[0].path.replace("\\", "/") : user.image
        user.email = email
        user.name = name
        user.image = image
        await user.save()

        return res.status(200).json({ message: 'Updated', messageType: 'success', user: user })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.update_password = async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    try {
        const user = await Admin.findOne({ _id: req.user.id })

        if (!user) return res.status(404).json({ message: 'Something went worng, Re-login please', messageType: 'alert' })



        const isMatched = await bcrypt.compare(oldPassword, user.password)
        if (!isMatched) return res.status(401).json({ message: 'Old password is incorrect', messageType: 'alert' })
        if (newPassword != confirmPassword) {
            return res.status(401).json({ message: 'Password Not match', messageType: 'alert' })

        }
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()
        return res.status(200).json({ message: 'Updated', messageType: 'success' })



    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.friends = async (req, res, next) => {
    try {
        // let newUS = new User({
        //     friends: [],
        //     requests: [],
        //     chats: [],
        //     name: 'Ragia',
        //     email: 'ragia@gmail.com',
        //     password: '$2a$12$x2bTaB36uF7yMf.WjXBXsunHc2k/nMmHoyHwXJXgkNExhYpDwkQiC',
        // })
        // await newUS.save()
        // newUS.friends.push('60a5b1c1f5454524c44df5a6')
        // await newUS.save()

        // const all = await User.find()
        // console.log(all);

        const user = await User.findOne({ _id: req.user.id });
        // await Chat.deleteMany({})
        // user.friends = []
        // user.requests = []
        // user.panding_requests = []
        // await user.save()
        const friends = await user.populate('friends.id').execPopulate()
        if (!friends) {
            const error = new Error("Could not find friends.");
            error.statusCode = 404;
            throw error;
        }

        const mappedFriends = friends.friends.map(r => ({
            chat: null,
            chatNumber: r.chatNumber,
            name: r.id.name,
            _id: r.id._id,
            typing: false,
            online: r.id.online,
            new: 0,
            image: r.id.image,
        }))
        for (const [index, f] of mappedFriends.entries()) {
            const chat = await Chat.findOne({ chatNumber: f.chatNumber })
            mappedFriends[index].chat = chat
        }
        return res.status(200).json(mappedFriends);
    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.search = async (req, res, next) => {
    let searchValue = req.query.q;
    try {
        let users = []
        if (searchValue) {
            var regxValue = new RegExp(searchValue, "i");
            users = await User.find({ $or: [{ name: regxValue }, { email: regxValue }, { mobile: regxValue }] })
            return res.status(200).json({ users: users })
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}


exports.panding_requests = async (req, res, next) => {
    try {


        const user = await User.findOne({ _id: req.user.id });
        // const requests = await user.populate('panding_requests').execPopulate()
        // if (!requests) {
        //     const error = new Error("Could not find requests.");
        //     error.statusCode = 404;
        //     throw error;
        // }
        return res.status(200).json(user.panding_requests);
    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}
exports.requests = async (req, res, next) => {
    try {


        const user = await User.findOne({ _id: req.user.id });
        const requests = await user.populate('requests').execPopulate()
        if (!requests) {
            const error = new Error("Could not find requests.");
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json(requests.requests);
    } catch (error) {

        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}



exports.post_request = async (req, res, next) => {
    const id = req.params.id
    try {
        const reciver = await User.findOne({ _id: id });
        if (!reciver) return res.status(401).json({ message: 'User Not Found!!', messageType: 'alert' })
        if (reciver.requests.includes(req.user.id)) return res.status(404).json({ message: 'Already requested to add this account', messageType: 'alert' })

        reciver.requests.push(req.user.id)
        await reciver.save()

        const sender = await User.findById(req.user.id)

        sender.panding_requests.push(reciver._id)
        await sender.save()
        return res.status(200).json({ message: 'Request Sended', messageType: 'success', panding_requests: sender.panding_requests })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}



exports.accept_request = async (req, res, next) => {
    const id = req.params.id;
    try {
        const sender = await User.findOne({ _id: id })
        if (!sender) return res.status(404).json({ message: 'Something went wrong, we cannot find this user', messageType: 'info', })

        const receiver = await User.findById(req.user.id)
        receiver.requests = receiver.requests.filter(r => r.toString() !== id.toString())

        let chat = new Chat({ conversation: [], userone: req.user.id, usertwo: id })
        await chat.save()
        receiver.friends.push({ id: id, chatNumber: chat.chatNumber })
        await receiver.save()

        sender.friends.push({ id: receiver._id, chatNumber: chat.chatNumber })

        //remove from panding requests
        sender.panding_requests = sender.panding_requests.filter(i => i.toString() != receiver._id.toString())
        await sender.save()


        const newFriend = {
            chatNumber: chat.chatNumber,
            name: sender.name,
            _id: sender._id,
            typing: false,
            new: 0,
            image: sender.image
        }


        const friendtoArray = []
        friendtoArray.push(newFriend)
        return res.status(200).json({ message: "Yaay, you'er friends now.", messageType: 'success', friendArray: friendtoArray })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}



exports.deny_request = async (req, res, next) => {
    const id = req.params.id;
    try {
        const sender = await User.findOne({ _id: id })
        if (!sender) return res.status(404).json({ message: 'Something went wrong, we cannot find this user', messageType: 'info', })

        const user = await User.findById(req.user.id)
        user.requests = user.requests.filter(r => r.toString() !== id.toString())
        await user.save()

        //remove from panding requests
        sender.panding_requests = sender.panding_requests.filter(i => i.toString() != user._id.toString())
        await sender.save()

        return res.status(200).json({ message: "Request delete", messageType: 'success', friendArray: [] })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}

exports.blockUnblock = async (req, res, next) => {
    const id = req.params.id;
    const status = req.query.status
    try {
        const chat = await Chat.findOne({ chatNumber: id })
        chat.chat_status = { active: (status === "true"), user: req.user.id }
        await chat.save()
        return res.status(200).json({ message: "Chat blocked", messageType: 'success' })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}


exports.unblock = async (req, res, next) => {
    const id = req.params.id;
    try {
        const chat = await Chat.findOne({ chatNumber: id })
        chat.chat_status = { active: true, user: req.user.id }
        await chat.save()
        return res.status(200).json({ message: "Chat Unblock", messageType: 'success' })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}
exports.remove_chat = async (req, res, next) => {
    const id = req.params.id;
    try {
        const chat = await Chat.findOne({ chatNumber: id })
        chat.conversation = []
        // await chat.save()
        return res.status(200).json({ message: "Chat delete", messageType: 'success' })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}
exports.remove_friend = async (req, res, next) => {
    const id = req.params.id;
    try {
        const friend = await User.findById(id)
        const me = await User.findById(req.user.id)
        console.log(me)
        console.log(friend)
        friend.friends = friend.friends.filter(user => user.id.toString() !== me._id.toString())
        me.friends = me.friends.filter(user => user.id.toString() !== friend._id.toString())
        await me.save()
        friend.save()
        return res.status(200).json({ message: "Frined Removed!", messageType: 'success' })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

}
