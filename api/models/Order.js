const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    uniqueId: {
        type: String,
        required: true
    },
    merchantTransactionId: {
        type: String,
        required: true
    },
    productName: { type: String },
    shippingAddressId: { type: String },
    shippingCharges: { type: String }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;