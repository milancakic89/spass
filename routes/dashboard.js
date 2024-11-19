const express = require("express");
let router = express.Router();
const dashboardControllers = require('../controllers/dashboard');
const validator = require("express-validator");

const sanitizeInputs = [
  validator.body("email", "Invalid does not Empty").not().isEmpty().escape(),
  validator.body("email", "Invalid email").isEmail().escape(),
  validator
    .body("password", "The minimum password length is 8 characters")
    .isLength({
      min: 8,
    })
    .escape(),
];

router.post("/add", sanitizeInputs, dashboardControllers.addItem);
router.post("/delete", sanitizeInputs, dashboardControllers.deleteItem);
router.get("/", dashboardControllers.dashboard);


module.exports = router;
