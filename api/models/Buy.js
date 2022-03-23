const mongoose = require("mongoose");

const buySchema = new mongoose.Schema({
  txnType: {
    type: String,
    required: false,
    default: "BUY"
  },
  quantity: String,
  totalAmount: String,
  metalType: String,
  rate: String,
  uniqueId: String,
  transactionId: String,
  userName: String,
  merchantTransactionId: String,
  invoiceNumber: String
}, { timestamps: true });

const Buy = mongoose.model("Buy", buySchema);

module.exports = Buy;
