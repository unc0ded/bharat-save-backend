const express = require("express");
const router = express.Router();
const controller = require("../controllers/augmont.controller");

router.post("/createuser", controller.createUser);

router.post("/login", controller.login);

router.post("/bank", controller.bankCreate);
router.put("/bank", controller.editBankDetail);
router.delete("/bank", controller.deleteBank);

router.get("/goldrate", controller.goldRate);

router.post("/buy", controller.buyGold);

router.post("/sell", controller.sellGold);

router.get("/buylist", controller.buyList);

router.get("/selllist", controller.sellList);

router.get("/isAuth", controller.isAuth);

router.get("/products", controller.productList);

router.post("/order", controller.orderProduct);

router.post("/address", controller.createAddress)

module.exports = router;
