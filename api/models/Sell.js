const mongoose = require("mongoose");

const sellSchema = new mongoose.Schema({
  txnType: {
    type: String,
    required: false,
    default: "SELL"
  },
  quantity: String,
  totalAmount: String,
  metalType: String,
  rate: String,
  uniqueId: String,
  transactionId: String,
  userName: String,
  merchantTransactionId: String,
  bankId: String
}, { timestamps: true });

const Sell = mongoose.model("Sell", sellSchema);

module.exports = Sell;
