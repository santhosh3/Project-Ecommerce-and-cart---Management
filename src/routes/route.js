const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const middleWare = require("../middleWare/auth")

router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile", middleWare.userAuth, userController.getDetails)
router.put("/user/:userId/profile", middleWare.userAuth, userController.updateUser)


module.exports = router;