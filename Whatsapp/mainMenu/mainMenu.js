const sendMsgs = require("../sendMessages");
const axios = require("axios").default;
const buyGold = require("./BuyGold");

exports.receiveMsg = async (message, accounts) => {
  if (accounts[message.from].subBlock === "Main Menu") {
    accounts[message.from].meunuAction = "Made Choice";
    accounts[message.from].subBlock = "Made Choice";
    sendMsgs.sendMsg(makeMainMenu(message, accounts));
  } else if (accounts[message.from].meunuAction === "Made Choice") {
    if (message.type === "interactive") {
      if (message.interactive.list_reply) {
        if (message.interactive.list_reply.id === "Buy Gold") {
          buyGold.buyChoice(message, accounts);
        } else if (message.interactive.list_reply.id === "Sell Gold") {
          var text = `Current sell price is ${
            getCurrentGoldRate().totalSellPrice
          }/g\nIn which form would you like to sell?`;
          var grambutton = sendMsgs.makeButton("gram", "gram");
          var rupeebutton = sendMsgs.makeButton("Money", "Money");
          var buttons = [grambutton, rupeebutton];
          accounts[message.from].subBlock = "Sell Choice";
          sendMsgs.sendInteractiveButtonMsg(message.from, buttons, text);
        } else if (message.interactive.list_reply.id === "Gift Gold") {
          var text = `Current buy price is ${
            getCurrentGoldRate().totalBuyPrice
          }/g\nIn which form would you like to gift?`;
          var grambutton = sendMsgs.makeButton("gram", "gram");
          var rupeebutton = sendMsgs.makeButton("Money", "Money");
          var buttons = [grambutton, rupeebutton];
          accounts[message.from].subBlock = "Gift Choice";
          sendMsgs.sendInteractiveButtonMsg(message.from, buttons, text);
        } else if (message.interactive.list_reply.id === "Current Price") {
        } else if (message.interactive.list_reply.id === "Locker") {
        } else if (message.interactive.list_reply.id === "Change Profile") {
        } else if (
          message.interactive.list_reply.id === "Recent Transactions"
        ) {
        } else if (message.interactive.list_reply.id === "Contact Us") {
        } else if (message.interactive.list_reply.id === "FeedBack") {
        }
      } else if (message.interactive.button_reply) {
        if (accounts[message.from].subBlock === "Buy Choice") {
          buyGold.amountGoldInput(message, accounts);
        }
      }
    } else {
      if (accounts[message.from].menuSection === "Buy Gold") {
        buyGold.buyUserGold(message, accounts);
      } else {
        accounts[message.from].subBlock = "Main Menu";
        this.receiveMsg(message, accounts);
      }
    }
  }
};

const makeMainMenu = (message, accounts) => {
  var rowBuyGold = sendMsgs.makeRow("Buy Gold", "Buy Gold", "to buy gold");
  var rowSellGold = sendMsgs.makeRow(
    "Sell Gold",
    "Sell Gold",
    "to sell your current gold"
  );
  var rowGiftGold = sendMsgs.makeRow("Gift Gold", "Gift Gold", "to gift gold");
  var rowCurrentGoldRate = sendMsgs.makeRow(
    "Current Price",
    "Current Price",
    "to get current gold price per gram"
  );
  var goldSectionRows = [
    rowBuyGold,
    rowSellGold,
    rowGiftGold,
    rowCurrentGoldRate,
  ];
  var sectionGold = sendMsgs.makeSection("Gold", goldSectionRows);
  var rowProfileLocker = sendMsgs.makeRow(
    "Locker",
    "Locker",
    "to get your current balance"
  );
  var rowProfileChange = sendMsgs.makeRow(
    "Change Profile",
    "Change Profile",
    "to change profile data"
  );
  var rowProfileTransactions = sendMsgs.makeRow(
    "Recent Transactions",
    "Recent Transactions",
    "to view your recent transactions"
  );
  var profileSectionRows = [
    rowProfileLocker,
    rowProfileChange,
    rowProfileTransactions,
  ];
  var sectionProfile = sendMsgs.makeSection("Profile", profileSectionRows);
  var rowContact = sendMsgs.makeRow(
    "Contact Us",
    "Contact Us",
    "to contact us"
  );
  var rowFeedback = sendMsgs.makeRow(
    "FeedBack",
    "FeedBack",
    "to give us feedback"
  );
  var supportSectionRows = [rowContact, rowFeedback];
  var sectionSupport = sendMsgs.makeSection("Support", supportSectionRows);
  var mainMenuSections = [sectionGold, sectionProfile, sectionSupport];
  var mainMenuText = `Welcome ${accounts[message.from].userName}`;
  var mainMenuMsg = sendMsgs.makeInteractiveListMsg(
    message.from,
    mainMenuSections,
    mainMenuText
  );
  return mainMenuMsg;
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
