const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.getUserDetails = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader) {
    return res.sendStatus(401);
  }
    
  try {
    const userToken = authHeader.split(' ')[1];
    jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
    
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(404).json({
          message: 'User does not exist.'
        });      
      }

      res.status(200).json({
        userName: user.userName,
        emailId: user.emailId,
        mobileNumber: user.mobileNumber
      });
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getBalanceDetails = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader) {
    return res.sendStatus(401);
  }

  try {
    const usertoken = authHeader.split(" ")[1];
  
    jwt.verify(usertoken, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.sendStatus(404);
      }

      res.status(200).json({
        totalAmount: user.totalAmount,
        goldBalance: user.goldBalance,
      });
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getBankDetails = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader) {
    return res.sendStatus(401);
  }

  try {
    const userToken = authHeader.split(' ')[1];

    jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
                
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.sendStatus(404);
      }
      
      res.status(200).json(user.userBanks);
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getAddresses = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader) {
    return res.sendStatus(401);
  }

  try {
    const userToken = authHeader.split(' ')[1];

    jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
                
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.sendStatus(404);
      }
      
      res.status(200).json(user.addresses);
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};