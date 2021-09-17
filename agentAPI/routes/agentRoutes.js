const router = require("express").Router();
const controller = require("../controllers/agent.controller");

//signup
router.post("/signup", controller.signup);
//login
router.post("/login", controller.login);
// get the customers with commission earned
router.get("/customercommissions", controller.customerCommissionDetails);

// router.get('/bankDetails', controller.getBankDetails);

module.exports = router;
