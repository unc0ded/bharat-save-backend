const User = require("../models/User");
const Agent = require("../../agentAPI/models/Agent");
const axios = require("axios").default;
const { nanoid } = require("nanoid/async");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const Buy = require("../models/Buy");
const qs = require("qs");
const Sell = require("../models/Sell");
const Order = require("../models/Order");

exports.buyList = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const uniqueId = user._id;

    try {
      const response = await axios.get(
        `${process.env.AUGMONT_URL}/merchant/v1/${uniqueId}/buy`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.augmontToken}`,
          },
        }
      );

      if (response.status === 200) {
        return res.json(response.data.result.data);
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
    } catch (error) {
      console.log(error);
      next();
    }
  });
};

exports.sellList = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const uniqueId = user._id;

    try {
      const response = await axios.get(
        `${process.env.AUGMONT_URL}/merchant/v1/${uniqueId}/sell`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.augmontToken}`,
          },
        }
      );

      if (response.status === 200) {
        return res.json(response.data.result.data);
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
    } catch (error) {
      console.log(error);
      next();
    }
  });
};

exports.productList = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    try {
      const response = await axios.get(
        `${process.env.AUGMONT_URL}/merchant/v1/products`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.augmontToken}`,
          }
        }
      );

      if (response.status === 200) {
        const goldCoinList = response.data.result.data.filter(
          (item) => item.jewelleryType === "coin" && item.metalType === "gold"
        );
        goldCoinList.sort(
          (a, b) => parseFloat(a.productWeight) - parseFloat(b.productWeight)
        );
        const finalResult = goldCoinList.map(
          ({
            redeemWeight,
            metalType,
            purity,
            jewelleryType,
            productSize,
            basePrice,
            description,
            status,
            productImages,
            ...item
          }) => item
        );

        return res.status(200).json(finalResult);
      }

      return res.sendStatus(500);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const id = user._id;
    try {
      const response = await axios.get(
        `${process.env.AUGMONT_URL}/merchant/v1/products`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.augmontToken}`,
          }
        }
      );

      if (response.status === 200) {
        const user = await User.findById(id).exec();
        if (!user) {
          return res.sendStatus(404);
        }
        const goldBalance = parseFloat(user.goldBalance);

        const goldCoinList = response.data.result.data.filter(
          (item) =>
            item.jewelleryType === "coin" &&
            item.metalType === "gold" &&
            parseFloat(item.productWeight) <= goldBalance
        );
        goldCoinList.sort(
          (a, b) => parseFloat(a.productWeight) - parseFloat(b.productWeight)
        );
        const finalResult = goldCoinList.map(
          ({
            redeemWeight,
            metalType,
            purity,
            jewelleryType,
            productSize,
            basePrice,
            description,
            status,
            productImages,
            ...item
          }) => {
            let makingCharge = 0;
            switch (parseFloat(item.productWeight)) {
              case 0.1:
                makingCharge = 200;
                break;
              case 0.5:
                makingCharge = 300;
                break;
              case 1:
                makingCharge = 350;
                break;
              case 2:
                makingCharge = 400;
                break;
              case 5:
                makingCharge = 500;
                break;
              case 8:
                makingCharge = 650;
                break;
              case 10:
                makingCharge = 800;
                break;
              case 20:
                makingCharge = 1100;
                break;
              case 50:
                makingCharge = 2100;
                break;
              default:
                makingCharge = null;
                break;
            }

            return { ...item, makingCharges: makingCharge.toString() };
          }
        );

        return res.status(200).json(finalResult);
      }

      res.sendStatus(500);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

exports.orderProduct = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    const id = decoded._id;
    const merchantTransactionId = await nanoid();

    try {
      const user = await User.findById(id).exec();
      if (!user) {
        return res.sendStatus(404);
      }

      const availabilityCheckResponse = await axios.get(
        `${process.env.AUGMONT_URL}/merchant/v1/products/${req.body.productId}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.augmontToken}`,
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (availabilityCheckResponse.status !== 200) {
        return res.status(400).json({
          error: availabilityCheckResponse.data.message,
        });
      }
      if (
        availabilityCheckResponse.data.result.data.stock <
        parseInt(req.body.quantity)
      ) {
        return res.status(500).json({
          error: "Not enough stock",
        });
      }
      const productName =
        availabilityCheckResponse.data.result.data.name.split(" (")[0];

      const formData = new FormData();
      formData.append("uniqueId", id);
      formData.append("mobileNumber", user.mobileNumber);
      formData.append("merchantTransactionId", merchantTransactionId);
      formData.append("user[shipping][addressId]", req.body.addressId);
      formData.append("product[0][sku]", req.body.productId);
      formData.append("product[0][quantity]", "1");

      const response = await axios.post(
        `${process.env.AUGMONT_URL}/merchant/v1/order`,
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.augmontToken}`,
            ...formData.getHeaders(),
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status === 200) {
        const order = await Order.create({
          uniqueId: id,
          merchantTransactionId:
            response.data.result.data.merchantTransactionId,
          orderId: response.data.result.data.orderId,
          quantity: availabilityCheckResponse.data.result.data.productWeight,
          metalType: availabilityCheckResponse.data.result.data.metalType,
          shippingCharges: response.data.result.data.shippingCharges,
          productName,
          shippingAddressId: req.body.addressId,
        });

        user.goldBalance = response.data.result.data.goldBalance;
        await user.save();

        return res.status(200).json({
          orderDetails: order,
          goldBalance: response.data.result.data.goldBalance,
          message: response.data.message,
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
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

exports.createUser = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({
      mobileNumber: req.body.mobileNumber,
    }).exec();

    if (existingUser) {
      return res.sendStatus(500); // user already exists
    }

    let referralUser;
    if (req.body.referralCode) {
      referralUser = await User.findOne({
        referralCode: req.body.referralCode
      }).exec();

      if (!referralUser) {
        return res.status(500).send('Invalid referral code');
      }
    }

    const uniqueId = await nanoid();

    const data = new FormData();
    data.append("mobileNumber", req.body.mobileNumber);
    data.append("emailId", req.body.emailId);
    data.append("uniqueId", uniqueId);
    data.append("userName", req.body.userName);
    data.append("userPincode", req.body.userPincode);

    const response = await axios.post(
      `${process.env.AUGMONT_URL}/merchant/v1/users`,
      data,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.augmontToken}`,
          ...data.getHeaders(),
        },
        validateStatus: (status) => status < 500
      }
    );

    if (response.status === 201) {
      const referralCode = await nanoid(8);
      const newUser = new User({
        _id: uniqueId,
        mobileNumber: req.body.mobileNumber,
        emailId: req.body.emailId,
        userName: req.body.userName,
        userPincode: req.body.userPincode,
        referralCode
      });

      if (referralUser) {
        // TODO : credit gold to both users and notify referral user
        newUser.referralId = referralUser._id;
      }

      const user = await newUser.save();

      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        token,
        userData: {
          _id: user._id,
          mobileNumber: user.mobileNumber,
          emailId: user.emailId,
          userName: user.userName,
          userPincode: user.userPincode
        },
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
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ mobileNumber: req.body.mobileNumber }).exec();

    if (!user) {
      return res.sendStatus(404); // user not found
    }

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      userData: {
        _id: user._id,
        mobileNumber: user.mobileNumber,
        emailId: user.emailId,
        userName: user.userName,
        userPincode: user.userPincode,
        goldBalance: user.goldBalance,
        referralCode: user.referralCode
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.isAuth = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (authHeader) {
      const usertoken = authHeader.split(" ")[1];

      jwt.verify(usertoken, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          return res
            .status(403)
            .send({ message: "Token expired or Invalid token" });
        } else {
          return res.status(200).send({ message: "Token authenticated" });
        }
      });
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.goldRate = async (req, res, next) => {
  try {
    const response = await axios.get(
      `${process.env.AUGMONT_URL}/merchant/v1/rates`,
      {
        headers: {
          Authorization: `Bearer ${process.env.augmontToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const buyPrice = response.data.result.data.rates.gBuy;
      const buyGst = response.data.result.data.rates.gBuyGst;
      const blockId = response.data.result.data.blockId;
      const sellPrice = response.data.result.data.rates.gSell;
      return res.status(200).json({
        buyPrice,
        sellPrice,
        blockId,
        buyGst,
      });
    }

    res.sendStatus(500);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.buyGold = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    if (req.body.amount != null && req.body.quantity != null) {
      return res.status(400).json({
        error: "Only one of amount or quantity is allowed",
      });
    }

    const uniqueId = user._id;
    const merchantTransactionId = await nanoid();
    try {
      const data = new FormData();
      data.append("lockPrice", req.body.buyPrice);
      data.append("metalType", "gold");
      data.append("merchantTransactionId", merchantTransactionId);
      data.append("uniqueId", uniqueId);
      data.append("blockId", req.body.blockId);

      if (req.body.amount != null) {
        data.append("amount", req.body.amount);
      } else if (req.body.quantity != null) {
        data.append("quantity", req.body.quantity);
      } else {
        return res.status(400).json({
          error: "Amount or quantity is required",
        });
      }

      const response = await axios.post(
        `${process.env.AUGMONT_URL}/merchant/v1/buy`,
        data,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.augmontToken}`,
            ...data.getHeaders(),
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status == 200) {
        const id = response.data.result.data.uniqueId;
        await Buy.create(response.data.result.data);
        const user = await User.findById(id).exec();

        if (user.referralId) {
          // TODO make changes here
          const agent = await Agent.findOne({
            referralCode: user.referralCode,
          }).exec();
          const newAgentCommission = (
            parseFloat(agent.customerEarnings) +
            0.03 * parseFloat(response.data.result.data.preTaxAmount)
          ).toFixed(2);

          await Agent.findByIdAndUpdate(agent._id, {
            customerEarnings: newAgentCommission,
          }).exec();
        }

        await User.findByIdAndUpdate(id, {
          goldBalance: response.data.result.data.goldBalance,
        }).exec();

        return res.status(200).json({
          goldBalance: response.data.result.data.goldBalance,
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
    } catch (error) {
      next(error);
      console.log(error);
    }
  });
};

exports.sellGold = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    if (req.body.amount != null && req.body.quantity != null) {
      return res.status(400).json({
        error: "Only one of amount or quantity is allowed",
      });
    }

    const uniqueId = user._id;
    const merchantTransactionId = await nanoid();
    try {
      const data = new FormData();
      data.append("uniqueId", uniqueId);
      data.append("mobileNumber", req.body.mobileNumber);
      data.append("lockPrice", req.body.lockPrice);
      data.append("blockId", req.body.blockId);
      data.append("metalType", "gold");
      data.append("merchantTransactionId", merchantTransactionId);
      data.append("userBank[userBankId]", req.body.userBankId);

      if (req.body.amount != null) {
        data.append("amount", req.body.amount);
      } else if (req.body.quantity != null) {
        data.append("quantity", req.body.quantity);
      } else {
        return res.status(400).json({
          error: "Amount or quantity is required",
        });
      }

      const response = await axios.post(
        `${process.env.AUGMONT_URL}/merchant/v1/sell`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${process.env.augmontToken}`,
            ...data.getHeaders(),
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status === 200) {
        const id = response.data.result.data.uniqueId;
        const { bankInfo, ...sellObj } = response.data.result.data;
        await Sell.create({ bankId: req.body.userBankId, ...sellObj });

        await User.findByIdAndUpdate(id, {
          goldBalance: response.data.result.data.goldBalance,
        }).exec();

        return res.status(200).json({
          goldBalance: response.data.result.data.goldBalance,
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
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

exports.bankCreate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const uniqueId = user._id;
    try {
      const response = await axios.post(
        `${process.env.AUGMONT_URL}/merchant/v1/users/${uniqueId}/banks`,
        qs.stringify({
          accountNumber: req.body.accountNumber,
          accountName: req.body.accountName,
          ifscCode: req.body.ifscCode,
        }),
        {
          headers: {
            Authorization: `Bearer ${process.env.augmontToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status == 200) {
        const id = response.data.result.data.uniqueId;
        const update = {
          $push: { userBanks: response.data.result.data },
        };

        await User.findOneAndUpdate({ _id: id }, update).exec();

        return res.status(200).json({
          userBankId: response.data.result.data.userBankId,
          uniqueId: response.data.result.data.uniqueId,
          accountNumber: response.data.result.data.accountNumber,
          accountName: response.data.result.data.accountName,
          ifscCode: response.data.result.data.ifscCode,
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
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

exports.editBankDetail = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    const uniqueId = decoded._id;

    if (!req.params.userBankId) {
      return res.status(400).json({
        error: "userBankId is required",
      });
    }

    const user = await User.findOne({
      _id: uniqueId,
      "userBanks.userBankId": req.params.userBankId
    }).exec();

    if (!user) {
      return res.status(400).json({
        error: "invalid bank id"
      });
    }

    try {
      const response = await axios.put(
        `${process.env.AUGMONT_URL}/merchant/v1/users/${uniqueId}/banks/${req.params.userBankId}`,
        qs.stringify({
          accountNumber: req.body.accountNumber,
          accountName: req.body.accountName,
          ifscCode: req.body.ifscCode
        }),
        {
          headers: {
            Authorization: `Bearer ${process.env.augmontToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status == 200) {
        const index = user.userBanks.findIndex(bank => bank.userBankId === req.body.userBankId);
        user.userBanks[index] = response.data.result.data;
        await user.save();

        return res.status(200).json({
          userBankId: response.data.result.data.userBankId,
          uniqueId: response.data.result.data.uniqueId,
          accountNumber: response.data.result.data.accountNumber,
          accountName: response.data.result.data.accountName,
          ifscCode: response.data.result.data.ifscCode,
        });
      }

      //console.log(response.data); // for debugging
      res.sendStatus(500);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

exports.deleteBank = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    const uniqueId = decoded._id;

    if (!req.params.userBankId) {
      return res.status(400).json({
        error: "userBankId is required"
      });
    }

    const user = await User.findOne({
      _id: uniqueId,
      "userBanks.userBankId": req.params.userBankId
    }).exec();

    if (!user) {
      return res.status(400).json({
        error: "invalid bank id"
      });
    }

    try {
      const response = await axios.delete(
        `${process.env.AUGMONT_URL}/merchant/v1/users/${uniqueId}/banks/${req.params.userBankId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.augmontToken}`,
            Accept: "application/json",
          },
          validateStatus: (status) => status < 500
        }
      );

      if (response.status == 200) {
        const index = user.userBanks.findIndex(bank => bank.userBankId === req.params.userBankId);
        user.userBanks.splice(index, 1);
        await user.save();

        return res.sendStatus(200);
      }

      //console.log(response.data); // for debugging
      res.sendStatus(500);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

exports.createAddress = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    const id = decoded._id;

    try {
      const response = await axios.post(
        `${process.env.AUGMONT_URL}/merchant/v1/users/${id}/address`,
        qs.stringify({
          name: req.body.name,
          mobileNumber: req.body.mobileNumber,
          address: req.body.address,
          pincode: req.body.pincode,
        }),
        {
          headers: {
            Authorization: `Bearer ${process.env.augmontToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status == 200) {
        const updatedUser = await User.findByIdAndUpdate(
          id,
          {
            $push: {
              addresses: {
                addressId: response.data.result.data.userAddressId,
                uniqueId: id,
                name: req.body.name,
                mobileNumber: req.body.mobileNumber,
                addressType: req.body.label,
                address: req.body.address,
                state: response.data.result.data.stateName,
                city: response.data.result.data.cityName,
                pincode: req.body.pincode,
              },
            },
          },
          { new: true }
        ).exec();

        return res
          .status(200)
          .json(
            updatedUser.addresses.filter(
              (address) =>
                address.addressId == response.data.result.data.userAddressId
            )
          );
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
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};
