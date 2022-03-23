const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    txnType: {
        type: String,
        required: false,
        default: "REDEEM",
    },
    metalType: String,
    quantity: String,
    orderId: String,
    uniqueId: String,
    merchantTransactionId: String,
    productName: String,
    shippingAddressId: String,
    shippingCharges: String
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
