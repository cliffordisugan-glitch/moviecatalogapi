const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET_KEY || 'MovieAPISecretKey';

module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    };
    return jwt.sign(data, secret, {});
};

module.exports.verify = (req, res, next) => {
    let token = req.headers.authorization;

    if (typeof token !== 'undefined') {
        token = token.slice(7, token.length);
        return jwt.verify(token, secret, (err, data) => {
            if (err) {
                return res.status(403).send({ auth: 'Failed' });
            } else {
                req.user = data;
                next();
            }
        });
    } else {
        return res.status(403).send({ auth: 'Failed' });
    }
};

module.exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(403).send({
            auth: 'Failed',
            message: 'Action Forbidden'
        });
    }
};