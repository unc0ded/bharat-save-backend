const Agent = require("../models/Agent");
const User = require("../../api/models/User");
const Buy = require("../../api/models/Buy");
const axios = require("axios").default;
const { nanoid } = require("nanoid");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const unique_id = nanoid();

  try {
    console.log(req.body);
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
            referralCode: req.body.referralCode,
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
                        $multiply: ["$totalBuy", 0.03],
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
