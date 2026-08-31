const User = require('../models/User');
const bcrypt = require('bcrypt');
const auth = require('../auth');

// Register User
module.exports.registerUser = async (req, res) => {
    try {
        if (!req.body.email.includes('@')) {
            return res.status(400).send({ message: 'Invalid email format' });
        }
        if (req.body.password.length < 8) {
            return res.status(400).send({ message: 'Password must be at least 8 characters' });
        }

        let newUser = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        await newUser.save();
        return res.status(201).send({ message: 'Registered Successfully' });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// Login User
module.exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({ message: 'No email found' });
        }

        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
        if (isPasswordCorrect) {
            return res.status(200).send({ access: auth.createAccessToken(user) });
        } else {
            return res.status(401).send({ message: 'Email and password do not match' });
        }
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// Get User Profile Details
module.exports.getProfile = async (req, res) => {
    try {
        // req.user.id comes from the decoded JWT in your auth.verify middleware
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.status(200).send({ user });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};