const sendMsgs = require("../sendMessages");
const User = require("../../api/models/User");
const FormData = require("form-data");
const axios = require("axios").default;
const { nanoid } = require("nanoid");
const Buy = require("../../api/models/Buy");
const augCtrl = require("../../api/controllers/augmont.controller");

exports.buyChoice = async (message, accounts) => {
  var data = await getCurrentGoldRate();
  var text = `Current gold price is ${data.totalBuyPrice}/g\nIn which form would you like to buy?`;
  var grambutton = sendMsgs.makeButton("gram", "gram");
  var rupeebutton = sendMsgs.makeButton("Money", "Money");
  var buttons = [grambutton, rupeebutton];
  accounts[message.from].subBlock = "Buy Choice";
  accounts[message.from].menuSection = "Buy Gold";
  sendMsgs.sendInteractiveButtonMsg(message.from, buttons, text);
};

exports.amountGoldInput = (message, accounts) => {
  if (message.interactive.button_reply.id === "gram") {
    var text = "Type weight of gold to buy (in grams). ";
    accounts[message.from].subBlock = "Buy gram";
    sendMsgs.sendTextMsg(message.from, text);
  } else if (message.interactive.button_reply.id === "Money") {
    var text = "Type amount of gold to buy (in rupees). ";
    accounts[message.from].subBlock = "Buy money";
    sendMsgs.sendTextMsg(message.from, text);
  }
};

exports.buyUserGold = async (message, accounts) => {
  if (accounts[message.from].subBlock === "Buy money") {
    var data = await getCurrentGoldRate();
    const amount = message.text.body;
    buyGold(data.buyPrice, amount, accounts[message.from]._id, data.blockId);
    accounts[message.from].mainBlock = "";
  } else if (accounts[message.from].subBlock === "Buy gram") {
    var data = await getCurrentGoldRate();
    const amount = (data.totalPrice * message.text.body).toFixed(2);
    buyGold(data.buyPrice, amount, accounts[message.from]._id, data.blockId);
  }
};

const getCurrentGoldRate = async () => {
  var goldPriceData = {};
  await axios
    .get(`${process.env.BACKEND_URL}/augmont/goldrate`)
    .then((res) => {
      goldPriceData = {
        totalBuyPrice: res.data.totalBuyPrice,
        tax: res.data.tax,
        blockId: res.data.blockId,
        buyPrice: res.data.goldPrice,
        totalSellPrice: res.data.totalSellPrice,
      };
    })

    .catch((err) => {
      console.log(err);
    });
  return goldPriceData;
};

const buyGold = async (buyPrice, amount, uniqueId, blockId) => {
  const merchantTransactionId = nanoid();
  const token = augCtrl.augmontToken;
  var data = new FormData();
  console.log(buyPrice, amount, uniqueId, blockId);
  data.append("lockPrice", buyPrice);
  data.append("metalType", "gold");
  data.append("amount", amount);
  data.append("merchantTransactionId", merchantTransactionId);
  data.append("uniqueId", uniqueId);
  data.append("blockId", blockId);

  const user = await User.findById(uniqueId).exec();

  var config = {
    method: "post",
    url: `${process.env.AUGMONT_URL}/merchant/v1/buy`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(async function (response) {
      const id = response.data.result.data.uniqueId;
      const newBuy = new Buy(response.data.result.data);
      await newBuy.save();

      const newAmount = (
        parseFloat(user.totalAmount) +
        parseFloat(response.data.result.data.preTaxAmount)
      ).toFixed(2);

      await User.findByIdAndUpdate(id, {
        totalAmount: newAmount,
        goldBalance: response.data.result.data.goldBalance,
      });
      var text = `Successfully bought ${response.data.result.data.quantity}g or ₹${response.data.result.data.totalAmount}`;

      sendMsgs.sendTextMsg(`91${user.mobileNumber}`, text);
    })
    .catch(function (error) {
      console.log(error);
      var text = `Buy unsuccessful due to an error`;

      sendMsgs.sendTextMsg(`91${user.mobileNumber}`, text);
    });
};
