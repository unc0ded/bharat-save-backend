const mongoose = require("mongoose");

const sellSchema = new mongoose.Schema({
  quantity: String,
  totalAmount: String,
  metalType: String,
  rate: String,
  uniqueId: String,
  transactionId: String,
  userName: String,
  merchantTransactionId: String,
  bankInfo: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
  }
}, { timestamps: true });

const Sell = mongoose.model("Sell", sellSchema);

module.exports = Sell;
