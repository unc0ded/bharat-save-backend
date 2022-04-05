const express = require("express");
const router = express.Router();
const controller = require("../controllers/augmont.controller");

//create user
router.post("/createuser", controller.createUser);
//create user
router.post("/login", controller.login);
//POST create user bank request
router.post("/bank", controller.bankCreate);
router.put("/bank", controller.editBankDetail);
//GET gold rate(incl. tax)
router.get("/goldrate", controller.goldRate);
//POST buy request
router.post("/buy", controller.buyGold);
//get buy list
router.get("/buylist", controller.buyList);
//POST sell request
router.post("/sell", controller.sellGold);
//get sell list
router.get("/selllist", controller.sellList);
// check if authenticated
router.get("/isAuth", controller.isAuth);
// Fetch augmont gold product list
router.get("/products", controller.productList);
// Place order for gold product
router.post("/order", controller.orderProduct);
// Create user address
router.post("/address", controller.createAddress)

module.exports = router;
