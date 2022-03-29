const jwt = require('jsonwebtoken');
const Buy = require('../models/Buy');
const Order = require('../models/Order');
const Sell = require('../models/Sell');
const User = require('../models/User');
const axios = require('axios').default;
const token = require('./augmont.controller').augmontToken;
const qs = require('qs');

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
        return res.sendStatus(404);      
      }

      res.status(200).json({
        userName: user.userName,
        emailId: user.emailId,
        mobileNumber: user.mobileNumber,
        userPincode: user.userPincode
      });
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.saveUserDetails = async (req, res, next) => {
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

      let updates = 0;
      if (req.body.userName) {
        user.userName = req.body.userName;
        updates++;
      }
      if (req.body.emailId) {
        user.emailId = req.body.emailId;
        updates++;
      }
      if (req.body.userPincode) {
        user.userPincode = req.body.userPincode;
        updates++;
      }
      if (updates === 0) {
        return res.sendStatus(400);
      }

      const response = await axios.put(
        `${process.env.AUGMONT_URL}/merchant/v1/users/${user._id}`,
        qs.stringify({
          userName: user.userName,
          emailId: user.emailId,
          userPincode: user.userPincode
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${token}`
          },
          validateStatus: status => status < 500
        }
      );

      if (response.status == 200) {
        await user.save();

        return res.status(200).json({
          userName: user.userName,
          emailId: user.emailId,
          mobileNumber: user.mobileNumber,
          userPincode: user.userPincode
        });
      }

      let errors = "";
      for (const errorCategory in response.data.errors) {
        for (const error of response.data.errors[errorCategory]) {
          errors = errors + error.message;
        }
      }
      res.status(400).json({
        "error(s)": errors,
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

exports.getTransactions = async (req, res, next) => {
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

      const buys = await Buy.find({ uniqueId: user._id });
      const sells = await Sell.find({ uniqueId: user._id });
      const orders = await Order.find({ uniqueId: user._id });

      const transactions = buys.concat(sells, orders);
      const sortedTransactions = transactions.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      res.status(200).json(sortedTransactions);
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};