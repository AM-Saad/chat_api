
const express = require("express");

const userController = require("../controllers/user");
const isAuth = require('../middleware/isAuth')
const router = express.Router();


router.get("/me", isAuth, userController.me);
router.put("/me", isAuth, userController.update_info);
router.put("/me/password", isAuth, userController.update_password);
router.get("/friends", isAuth, userController.friends);
router.delete("/friends/:id", isAuth, userController.remove_friend);

router.get('/search', userController.search);

router.get("/pandingrequests", isAuth, userController.panding_requests);
router.get("/requests", isAuth, userController.requests);
router.post("/requests/:id", isAuth, userController.post_request);
router.put("/requests/:id", isAuth, userController.accept_request);
router.delete("/requests/:id", isAuth, userController.deny_request);

router.delete("/chat/:id", isAuth, userController.remove_chat);
router.put("/chat/:id/block-unblock", isAuth, userController.blockUnblock);
// router.put("/chat/:id/unblock", isAuth, userController.unblock);





module.exports = router;
