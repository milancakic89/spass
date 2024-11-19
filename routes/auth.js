const express = require("express");
let router = express.Router();
const authControllers = require("../controllers/auth.js");
const validator = require('express-validator');
const { paswordLengthCheck } = require('../middleware/passwordLengthcheck.js')


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

router.get("/login", authControllers.loginPage);
router.get("/activate/:token", authControllers.activateAccount);
router.get("/verify", authControllers.verifyPage);
router.get("/signup", authControllers.signupPage);

router.post("/signup", sanitizeInputs, paswordLengthCheck, authControllers.signup);
router.post("/login", sanitizeInputs, paswordLengthCheck, authControllers.login);
router.post("/verify", sanitizeInputs, authControllers.verify);

module.exports = router;
