const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  referralCode: {
    type: String,
  },
  referredCode: {
    type: String,
  },
  emailId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  totalEarnings: {
    type: String,
  },
  customerEarnings: {
    type: String,
  },
  resellerEarnings: {
    type: String,
  },
  unwithdrawnEarnings: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Agent", agentSchema);
