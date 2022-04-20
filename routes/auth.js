const express = require("express");
const { body } = require("express-validator/check");
const User = require("../models/User");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/isAuth");
const router = express.Router();
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter A Valid Email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject("E-mail Address Already Exists");
            }
          });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password has to be atleast 6 charcetries"),
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("You have to choose a name")
  ],
  authController.signUp
);

router.post("/login", authController.login);



module.exports = router;
