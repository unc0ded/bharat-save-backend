const User = require("../models/User");
const axios = require("axios").default;
const { nanoid } = require("nanoid");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const Buy = require("../models/Buy");
const qs = require("qs");
const Sell = require("../models/Sell");
const Order = require("../models/Order");

const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiZWVmMTU1NDNlZTdkMjdkNDY5YzM3YTU5NWJhMTU0NDdjZjJmOTRlYTYwZjljOTlkNjY2NGVhOGEyZDkxYzA1ODhlNmY0OTY5NTYzMDRhODYiLCJpYXQiOjE2MzU0MjA4NDYsIm5iZiI6MTYzNTQyMDg0NiwiZXhwIjoxNjM4MDEyODQ2LCJzdWIiOiI1MDAwMDE0NSIsInNjb3BlcyI6W119.GQE9pvkScxbfi3NJVtEAm5hpZbEhi4IM0bZ_HFND63lxPnxP9QvPeAe_mLjCefsf3m3aBJ0UFD-WYaMysjKXn5mIdQDqBv7NhC3yRoSDxKLkEE0JKRE0CeGKs82zTgWTlAZYtxATNq2Zx-JbQF00LqbPKJyLs3vBHTzb36X9i2BzXh3M-IA9T2J9r-k7rq4_Ubf4Yjz6lv0wR-L4hsRDuEWAntauiXbkmDGYVN0oSPAzHnfaMgiU8UlJUG-JmSt7FQdVYkU1FB2peWmjl19GSqDzddNTlmbYXPsPdY6Bt93Ntf9y-sbQg20QOo3HuVUbaLbb9bsuXpwrVzJL4a6-k8sn2c8cBbXWKZ_pDr7SnYiX6gxZT2A17jmXEaJq_tCaDV30XkpnsHv5ubK9ffrOjhGVfQgB75rekMIV5c2RDZDcqJ4HLeDrRKYsnKm36hvxj5yecS4txV0-LuOiUGqxxZ97k9T9ZScfNAvKKRjRB9KV5Z7d2BJPAnq2pyOF57u6v4_GJewpbEFsTxapcElATrgWkAX3pJRZ7RdCChKw2CbwrU_8bc1fwcqgcbebcF6DfRVWxc1z2_Bwojt14yza4jAyhogG6IhtzfWIjX1HVAF5PfO8_j8GXgSvMIdKYOlYx4wYOJeUT96iCQRceCmZa9hWpabAfGoCDCs8Wk3-vNU";
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
  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const uniqueCode = user._id;

    try {
      const config = {
        method: "get",
        url: `${process.env.AUGMONT_URL}/merchant/v1/${uniqueCode}/buy`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      axios(config)
        .then(function (response) {
          res.json(response.data.result.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
      next();
    }
  });
};

exports.sellList = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userToken = authHeader.split(" ")[1];

  jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const uniqueCode = user._id;
    try {
      const config = {
        method: "get",
        url: `${process.env.AUGMONT_URL}/merchant/v1/${uniqueCode}/sell`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      axios(config)
        .then(function (response) {
          res.json(response.data.result.data);
        })
        .catch(function (error) {
          console.log(error);
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

      res.sendStatus(500);
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

        res.status(200).json(finalResult);
      }
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
          sku: req.body.productId,
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

      res.status(400).json({
        error: response.data.message,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};

exports.createUser = async (req, res, next) => {
  const unique_id = nanoid();
  const data = new FormData();
  data.append("mobileNumber", req.body.mobileNumber);
  data.append("emailId", req.body.emailId);
  data.append("uniqueId", unique_id);
  data.append("userName", req.body.userName);
  data.append("userPincode", req.body.userPincode);

  const config = {
    method: "post",
    url: `${process.env.AUGMONT_URL}/merchant/v1/users`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...data.getHeaders(),
    },
    data: data,
  };
  try {
    await User.findOne(
      { mobileNumber: req.body.mobileNumber },
      async (err, foundUser) => {
        if (foundUser) {
          res.status(500).send("User already exists");
        } else {
          await axios(config)
            .then(async (response) => {
              console.log(response.data.message);
              //create a user
              const user = new User({
                _id: unique_id,
                mobileNumber: req.body.mobileNumber,
                emailId: req.body.emailId,
                userName: req.body.userName,
                userPincode: req.body.userPincode,
              });
              try {
                await user.save();
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
            })
            .catch(function (error) {
              console.log(error);
            });
        }
      }
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.login = async (req, res) => {
  try {
    //check if email doesn't exist
    User.findOne(
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

exports.isAuth = async (req, res) => {
  const authHeader = req.headers.authorization;
  try {
    if (authHeader) {
      const usertoken = authHeader.split(" ")[1];

      jwt.verify(usertoken, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        } else {
          return res.sendStatus(200);
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
    axios
      .get(`${process.env.AUGMONT_URL}/merchant/v1/rates`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        const BuyPrice = response.data.result.data.rates.gBuy;
        const tax = response.data.result.data.rates.gBuyGst;
        const blockId = response.data.result.data.blockId;
        const totalSellPrice = parseFloat(
          response.data.result.data.rates.gSell
        ).toFixed(2);
        const totalBuyPrice = (parseFloat(BuyPrice) + parseFloat(tax)).toFixed(
          2
        );
        res.status(200).json({
          ok: 1,
          totalBuyPrice: totalBuyPrice,
          totalSellPrice: totalSellPrice,
          blockId: blockId,
          goldPrice: BuyPrice,
          tax: tax,
        });
      })
      .catch((error) => {
        console.log(error);
        next(error);
      });
  } catch (error) {
    console.log(error);
    next();
  }
};

exports.buyGold = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const merchantTransactionId = nanoid();
  if (authHeader) {
    const usertoken = authHeader.split(" ")[1];

    jwt.verify(usertoken, process.env.TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      if (req.body.amount != null && req.body.quantity != null) {
        return res.status(400).json({
          error: "Only one of amount or quantity is allowed",
        });
      }

      const uniqueId = user._id;
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
          const newBuy = new Buy(response.data.result.data);
          await newBuy.save();
          const user = await User.findById(id).exec();
          const newAmount = (
            parseFloat(user.totalAmount) +
            parseFloat(response.data.result.data.preTaxAmount)
          ).toFixed(2);

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
      } catch (error) {
        next(error);
        console.log(error);
      }
    });
  } else {
    res.sendStatus(401);
    next();
  }
};

exports.sellGold = async (req, res, next) => {
  const merchantTransactionId = nanoid();
  const authHeader = req.headers.authorization;

  if (authHeader) {
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

          res.status(200).json({
            totalAmount: newAmount,
            goldBalance: response.data.result.data.goldBalance,
          });
        } else {
          res.status(400).json({
            error: response.data.message,
          });
        }
      } catch (error) {
        console.log(error);
        next(error);
      }
    });
  } else {
    res.sendStatus(401);
    next();
  }
};

exports.bankCreate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
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

          res.status(200).json({
            userBankId: response.data.result.data.userBankId,
            uniqueId: response.data.result.data.uniqueId,
            accountNumber: response.data.result.data.accountNumber,
            accountName: response.data.result.data.accountName,
            ifscCode: response.data.result.data.ifscCode,
          });
        } else {
          res.status(400).json({
            error: response.data.message,
          });
        }
      } catch (error) {
        console.log(error);
        next(error);
      }
    });
  } else {
    res.sendStatus(401);
    next();
  }
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

        return res
          .status(200)
          .json(
            updatedUser.addresses.filter(
              (address) =>
                address.addressId == response.data.result.data.userAddressId
            )
          );
      }

      res.status(400).json({
        error: response.data.message,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
};
