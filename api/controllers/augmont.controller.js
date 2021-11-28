const User = require("../models/User");
const Agent = require("../../agentAPI/models/Agent");
const axios = require("axios").default;
const { nanoid } = require("nanoid");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const Buy = require("../models/Buy");
const qs = require("qs");
const Sell = require("../models/Sell");
const Order = require("../models/Order");

const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYjYxN2E3MjM5YTk0YjJjN2IwYTY0OGM3NjBjZGFjMGFhNWY4Yzc4NGVhOWRmZGIzMWFhODdlMWI5MDMzM2JiMTA5NmZiMDc2NTAzMmYyNmMiLCJpYXQiOjE2MzgwOTI2MjAsIm5iZiI6MTYzODA5MjYyMCwiZXhwIjoxNjQwNjg0NjIwLCJzdWIiOiI1MDAwMDE0NSIsInNjb3BlcyI6W119.fJMUdhYEjHOLMrkVjO2q9GK3-pZ8l1NKtFu3WjS2-JezvNZRHejPGoDQQPx2z8ZB2Uo6aLSTfCO_ZVIoSrnjB9J2m2hFcg7lxnGaoMmJd6r3at3icTknpT3YgIFN887iobRAeo1eRFXGM8qRkEruE0yRCdrObISxYQKMxRCJ-yXdU7a-CxxFjLvWCX3rMSGqPn784nfPkCHvlSHQIcdRbG3clwqo5RLeIIyDzdeyFdIYr5Ugy6ZpsbFzLUUpPxAs0A00E0elDkMV6Up_Kp-AcxYFLl8FruvVf58SPP21VeMR9hWKP-li2SYA7I3nq0_ngzJe8YaGT2JMLaqQLeGPIknBHlTCXs3WY-oQ7xXVL3Tf97_KUrze3GbLM6z0l0ACMGUcAicS_9UtJcP_MGXb7gMNkSRqo6LWjJ_irKTnOkIh_U9Bzwj-Fj--Cc8kpV0zmUy7vl_T6pBhbeD7uysfcGqDg5VcKjDvl-G5EKXY4UXJajuesYvhj7Z32Hwlw9gzguA6S0h0MUd-oRTmng6JjueU-BEDUEym8TZsy--zHxX8cdEyCJDWujalfctSRCy4id1KhO2zC3FPFilv99Z9Ml8DiM9U1oD4zm9dD9w6cwrn-zGh7v92d1TDBCAL1PYJNdDLUG2fClUcAflBgW7emcrNtLWcco8xVGQWx11QhcE";
exports.augmontToken = token;
// var data = new FormData();
// data.append("email", "devansh299@gmail.com");
// data.append("password", "FsKaH@12$3Kl#");

// var config = {
//   method: "post",
//   url: "https://uat-api.augmontgold.com/api/merchant/v1/auth/login",
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//     ...data.getHeaders(),
//   },
//   data: data
// };

// axios(config)
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

//sanskar's uniquecode =e505e888-ca94-429f-a2e9-52b97b93191f

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
      const response = await axios.get(`${process.env.AUGMONT_URL}/merchant/v1/${uniqueId}/buy`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        return res.json(response.data.result.data);
      }
      
      let errors = '';
      for (const errorCategory in response.data.errors) {
        for (const error of response.data.errors[errorCategory]) {
          errors = errors + error.message;
        };
      };
      res.status(400).json({
        'error(s)': errors,
      });
    } catch (error) {
      console.log(error);
      next();
    }
  });
};

exports.sellList = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader) {
    return res.sendStatus(401);
  }

  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const uniqueId = user._id;

    try {
      const response = await axios.get(`${process.env.AUGMONT_URL}/merchant/v1/${uniqueId}/sell`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        return res.json(response.data.result.data);
      }

      let errors = '';
      for (const errorCategory in response.data.errors) {
        for (const error of response.data.errors[errorCategory]) {
          errors = errors + error.message;
        };
      };
      res.status(400).json({
        'error(s)': errors,
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
          params: {
            count: 30,
            page: 1,
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
          params: {
            count: 30,
            page: 1,
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const user = await User.findById(id);
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
    const merchantTransactionId = nanoid();

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.sendStatus(404);
      }

      const availabilityCheckResponse = await axios.get(
        `${process.env.AUGMONT_URL}/merchant/v1/products/${req.body.productId}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
            Authorization: `Bearer ${token}`,
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

      let errors = '';
      for (const errorCategory in response.data.errors) {
        for (const error of response.data.errors[errorCategory]) {
          errors = errors + error.message;
        };
      };
      res.status(400).json({
        'error(s)': errors,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

exports.createUser = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ mobileNumber: req.body.mobileNumber });

    if (existingUser) {
      return res.sendStatus(500);     // user already exists
    }

    const uniqueId = nanoid();

    const data = new FormData();
    data.append("mobileNumber", req.body.mobileNumber);
    data.append("emailId", req.body.emailId);
    data.append("uniqueId", uniqueId);
    data.append("userName", req.body.userName);
    data.append("userPincode", req.body.userPincode);

    const response = await axios.post(`${process.env.AUGMONT_URL}/merchant/v1/users`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...data.getHeaders()
      },
      data: data
    });

    if (response.status === 200) {
      const user = await User.create({
        _id: uniqueId,
        mobileNumber: req.body.mobileNumber,
        emailId: req.body.emailId,
        userName: req.body.userName,
        userPincode: req.body.userPincode,
        referralCode: req.body.referralCode
      });

      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: "7d" });

      return res.status(200).json({
        token,
        userData: {
          _id: user._id,
          mobileNumber: user.mobileNumber,
          emailId: user.emailId,
          userName: user.userName
        }
      });
    }

    let errors = '';
    for (const errorCategory in response.data.errors) {
      for (const error of response.data.errors[errorCategory]) {
        errors = errors + error.message;
      };
    }
    res.status(400).json({
      'error(s)': errors,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ mobileNumber: req.body.mobileNumber });

    if (!user) {
      return res.sendStatus(404);   // user not found
    }

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      token,
      userData: {
        _id: user._id,
        mobileNumber: user.mobileNumber,
        emailId: user.emailId,
        userName: user.userName
      }
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
};

exports.goldRate = async (req, res, next) => {
  try {
    const response = await axios.get(`${process.env.AUGMONT_URL}/merchant/v1/rates`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

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
    next();
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
    const merchantTransactionId = nanoid();
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
            Authorization: `Bearer ${token}`,
            ...data.getHeaders(),
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status == 200) {
        const id = response.data.result.data.uniqueId;
        await Buy.create(response.data.result.data);
        const user = await User.findById(id).exec();

        const newAmount = (
          parseFloat(user.totalAmount) +
          parseFloat(response.data.result.data.preTaxAmount)
        ).toFixed(2);

        if (user.referralCode) {
          const agent = await Agent.findOne({
            referralCode: user.referralCode,
          }).exec();
          const newAgentCommission = (
            parseFloat(agent.customerEarnings) +
            0.03 * parseFloat(response.data.result.data.preTaxAmount)
          ).toFixed(2);

          if (user.referralCode) {
            const agent = await Agent.findOne({
              referralCode: user.referralCode,
            }).exec();
            const newAgentCommission = (
              parseFloat(agent.customerEarnings) +
              0.015 * parseFloat(response.data.result.data.preTaxAmount)
            ).toFixed(2);
            await Agent.findByIdAndUpdate(agent._id, {
              customerEarnings: newAgentCommission,
            });
          }

          await User.findByIdAndUpdate(id, {
            totalAmount: newAmount,
            goldBalance: response.data.result.data.goldBalance,
          });

          res.status(200).json({
            totalAmount: newAmount,
            goldBalance: response.data.result.data.goldBalance,
            OK: 1,
          });
        } else {
          res.status(400).json({
            error: response.data.message,

          });
        }

        await User.findByIdAndUpdate(id, {
          totalAmount: newAmount,
          goldBalance: response.data.result.data.goldBalance,
        });

        return res.status(200).json({
          totalAmount: newAmount,
          goldBalance: response.data.result.data.goldBalance,
          OK: 1,
        });
      }

      let errors = '';
      for (const errorCategory in response.data.errors) {
        for (const error of response.data.errors[errorCategory]) {
          errors = errors + error.message;
        };
      };
      res.status(400).json({
        'error(s)': errors,
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
    const merchantTransactionId = nanoid();
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
            Authorization: `Bearer ${token}`,
            ...data.getHeaders(),
          },
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status === 200) {
        const id = response.data.result.data.uniqueId;
        const newSell = new Sell(response.data.result.data);
        await newSell.save();
        const user = await User.findById(id).exec();
        const newAmount = (
          parseFloat(user.totalAmount) -
          parseFloat(response.data.result.data.preTaxAmount)
        ).toFixed(2);

        await User.findByIdAndUpdate(id, {
          totalAmount: newAmount,
          goldBalance: response.data.result.data.goldBalance,
        });

        return res.status(200).json({
          totalAmount: newAmount,
          goldBalance: response.data.result.data.goldBalance,
        });
      }
          
      let errors = '';
      for (const errorCategory in response.data.errors) {
        for (const error of response.data.errors[errorCategory]) {
          errors = errors + error.message;
        };
      };
      res.status(400).json({
        'error(s)': errors,
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
            Authorization: `Bearer ${token}`,
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

        await User.findOneAndUpdate({ _id: id }, update);

        return res.status(200).json({
          userBankId: response.data.result.data.userBankId,
          uniqueId: response.data.result.data.uniqueId,
          accountNumber: response.data.result.data.accountNumber,
          accountName: response.data.result.data.accountName,
          ifscCode: response.data.result.data.ifscCode,
        });
      }

      let errors = '';
      for (const errorCategory in response.data.errors) {
        for (const error of response.data.errors[errorCategory]) {
          errors = errors + error.message;
        };
      };
      res.status(400).json({
        'error(s)': errors,
      });
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
            Authorization: `Bearer ${token}`,
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
        );

        return res.status(200).json(
          updatedUser.addresses.filter((address) => address.addressId == response.data.result.data.userAddressId)
        );
      }

      let errors = '';
      for (const errorCategory in response.data.errors) {
        for (const error of response.data.errors[errorCategory]) {
          errors = errors + error.message;
        };
      };
      res.status(400).json({
        'error(s)': errors,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};
