const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.getUserDetails = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    try {
        if (authHeader) {
            const userToken = authHeader.split(' ')[1];
            jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
                if (err) {
                    return res.sendStatus(403);
                }
    
                const user = await User.findById(decoded._id);
                if (!user) {
                    return res.status(404).send({
                        message: 'User does not exist.'
                    });
                    
                }
                res.json({
                    userName: user.userName,
                    emailId: user.emailId,
                    mobileNumber: user.mobileNumber
                });
            });
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.getBankDetails = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    try {
        if (authHeader) {
            const userToken = authHeader.split(' ')[1];
            jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
                if (err) {
                    return res.sendStatus(403);
                }
                
                const user = await User.findById(decoded._id);
                if (!user) {
                    return res.status(404).send({
                        message: 'User does not exist.'
                    });
                    
                }
                res.json(user.userBanks);
            });
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};