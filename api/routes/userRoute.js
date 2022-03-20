const router = require('express').Router();
const controller = require('../controllers/user.controller');

router.get('/', controller.getUserDetails);

router.get('/balance', controller.getBalanceDetails);

router.get('/transactions', controller.getTransactions);

router.get('/bankDetails', controller.getBankDetails);

router.get('/addresses', controller.getAddresses);

module.exports = router;