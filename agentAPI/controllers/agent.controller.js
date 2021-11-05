const Agent = require("../models/Agent");
const User = require("../../api/models/User");
const Buy = require("../../api/models/Buy");
const axios = require("axios").default;
const { nanoid } = require("nanoid");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const referralCodes = require("referral-codes");

exports.signup = async (req, res, next) => {
  const unique_id = nanoid();
  const referralCode = referralCodes.generate({
    length: 8,
    count: 1,
  })[0];
  try {
    await Agent.findOne(
      { mobileNumber: req.body.mobileNumber },
      async (err, foundUser) => {
        if (foundUser) {
          res.status(500).send("User already exists");
        } else {
          const agent = new Agent({
            _id: unique_id,
            mobileNumber: req.body.mobileNumber,
            emailId: req.body.emailId,
            userName: req.body.userName,
            referralCode: referralCode,
            referredcode: req.body.referredCode,
            customerEarnings: "0.00",
            agentEarnings: "0.00",
          });
          try {
            await agent.save();
            const appToken = jwt.sign(
              { _id: unique_id },
              process.env.TOKEN_SECRET,
              {
                expiresIn: "7d",
              }
            );

            res.json({
              ok: 1,
              token: appToken,
              userData: {
                _id: unique_id,
                mobileNumber: req.body.mobileNumber,
                emailId: req.body.emailId,
                userName: req.body.userName,
                referralCode: referralCode,
              },
            });
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    //check if email doesn't exist
    Agent.findOne(
      { mobileNumber: req.body.mobileNumber },
      async (err, foundUser) => {
        if (!foundUser) {
          res.status(404).send("User not found");
        } else {
          const apptoken = jwt.sign(
            { _id: foundUser._id },
            process.env.TOKEN_SECRET,
            {
              expiresIn: "7d",
            }
          );
          res.json({
            token: apptoken,
            userData: {
              _id: foundUser._id,
              mobileNumber: foundUser.mobileNumber,
              emailId: foundUser.emailId,
              userName: foundUser.userName,
              referralCode: foundUser.referralCode,
            },
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.customerCommissionDetails = async (req, res, next) => {
  const referralCode = req.body.referralCode;
  const authHeader = req.headers.authorization;
  try {
    if (authHeader) {
      const usertoken = authHeader.split(" ")[1];

      jwt.verify(
        usertoken,
        process.env.TOKEN_SECRET,
        async (err, decodedToken) => {
          if (err) {
            console.log(err);
            return res.sendStatus(403);
          } else {
            try {
              const agent = await Agent.findOne(
                { _id: decodedToken._id },
                "referralCode"
              ).exec();
              const referralCode = agent.referralCode;
              let referredCustomers = await User.find(
                { referralCode: referralCode },
                "_id userName"
              ).exec();
              referredCustomers = JSON.parse(JSON.stringify(referredCustomers));

              for (let i = 0; i < referredCustomers.length; i++) {
                const customerCommission = await Buy.aggregate([
                  {
                    $match: {
                      uniqueId: referredCustomers[i]._id,
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      totalBuy: {
                        $sum: {
                          $toDouble: "$preTaxAmount",
                        },
                      },
                    },
                  },
                  {
                    $project: {
                      totalCommission: {
                        $multiply: ["$totalBuy", 0.015],
                      },
                    },
                  },
                ]).exec();
                referredCustomers[i].totalCommission =
                  customerCommission[0].totalCommission.toFixed(2);
              }
              res.json(referredCustomers);
            } catch (error) {
              console.log(error);
              next(error);
            }
          }
        }
      );
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.agentCommissionDetails = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  try {
    if (authHeader) {
      const usertoken = authHeader.split(" ")[1];

      jwt.verify(
        usertoken,
        process.env.TOKEN_SECRET,
        async (err, decodedToken) => {
          if (err) {
            console.log(err);
            return res.sendStatus(403);
          } else {
            try {
              const agent = await Agent.findOne(
                { _id: decodedToken._id },
                "referralCode"
              ).exec();
              const referralCode = agent.referralCode;
              let referredAgents = await Agent.find(
                { referredCode: referralCode },
                "_id userName customerEarnings"
              ).exec();
              referredAgents = JSON.parse(JSON.stringify(referredAgents));

              for (let i = 0; i < referredAgents.length; i++) {
                const customerEarnings = parseFloat(
                  referredAgents[i].customerEarnings
                );
                const agentCommission = await Agent.aggregate([
                  {
                    $match: {
                      _id: referredAgents[i]._id,
                    },
                  },
                  {
                    $project: {
                      _id: referredAgents[i]._id,
                      userName: "$userName",
                      totalCommission: {
                        $multiply: [customerEarnings, 0.1],
                      },
                    },
                  },
                ]).exec();

                referredAgents[i].totalCommission =
                  agentCommission[0].totalCommission.toFixed(2);
              }

              res.json(referredAgents);
            } catch (error) {
              console.log(error);
              next(error);
            }
          }
        }
      );
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.customerTransactionDetails = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  try {
    if (authHeader) {
      const usertoken = authHeader.split(" ")[1];

      jwt.verify(
        usertoken,
        process.env.TOKEN_SECRET,
        async (err, decodedToken) => {
          if (err) {
            console.log(err);
            return res.sendStatus(403);
          } else {
            try {
              const agent = await Agent.findOne(
                { _id: decodedToken._id },
                "referralCode"
              ).exec();
              const referralCode = agent.referralCode;
              let referredCustomers = await User.find(
                { referralCode: referralCode },
                "_id userName"
              ).exec();
              referredCustomers = JSON.parse(JSON.stringify(referredCustomers));
              const buysTxnList = [];

              for (let i = 0; i < referredCustomers.length; i++) {
                const customerTxnCommission = await Buy.aggregate([
                  {
                    $match: {
                      uniqueId: referredCustomers[i]._id,
                    },
                  },
                  {
                    $addFields: {
                      preTaxBuyAmount: { $toDouble: "$preTaxAmount" },
                    },
                  },

                  {
                    $project: {
                      userName: referredCustomers[i].userName,
                      date: "$date",
                      preTaxBuyAmount: "$preTaxBuyAmount",
                      totalCommission: {
                        $multiply: ["$preTaxBuyAmount", 0.015],
                      },
                    },
                  },
                ]).exec();
                buysTxnList.push(...customerTxnCommission);
              }
              res.json(buysTxnList);
            } catch (error) {
              console.log(error);
              next(error);
            }
          }
        }
      );
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    console.log(error);
  }
};
