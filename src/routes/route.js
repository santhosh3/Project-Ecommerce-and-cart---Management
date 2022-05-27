const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const middleWare = require("../middleWare/auth")
const productController = require("../controller/productController")

/**********************************User api****************************************************** */
router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile", middleWare.userAuth, userController.getDetails)
router.put("/user/:userId/profile", middleWare.userAuth, userController.updateUser)

/***********************************************Product api********************************************************************************* */
router.post("/products",productController.createProduct)
router.get("/products/:productId",productController.getProductbyId)
router.put("/products/:productId",productController.updateProduct)
router.delete("/products/:productId",productController.deleteProduct)

module.exports = router;