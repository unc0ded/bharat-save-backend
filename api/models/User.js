const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  emailId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userPincode: {
    type: String,
    required: true,
  },
  goldBalance: {
    type: String,
    default: "0.00",
  },
  activePlans: [
    {
      subscriptionId: {
        type: String,
        required: true,
      },
      planName: {
        type: String,
        enum: [
          "Round Up",
          "Daily Savings",
          "Weekly Savings",
          "Monthly Savings",
        ],
        required: true,
      },
      active: {
        type: Boolean,
        default: false,
      },
    },
  ],
  userBanks: [
    {
      userBankId: { type: String },
      uniqueId: { type: String },
      bankId: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      accountName: { type: String },
      ifscCode: { type: String },
      status: { type: String },
    },
  ],
  addresses: [
    {
      addressId: { type: String },
      uniqueId: { type: String },
      addressType: { type: String },
      name: { type: String },
      mobileNumber: { type: String },
      address: { type: String },
      state: { type: String },
      city: { type: String },
      pincode: { type: String },
    },
  ],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
