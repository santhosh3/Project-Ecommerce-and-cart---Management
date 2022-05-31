const express = require('express');
const router = express.Router();
const userController = require("../controller/userController")
const middleWare = require("../middleWare/auth")
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")

/**********************************User api****************************************************** */
router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile", middleWare.userAuth, userController.getDetails)
router.put("/user/:userId/profile", middleWare.userAuth, userController.updateUser)

/***********************************************Product api********************************************************************************* */
router.post("/products",productController.createProduct)
router.get("/products", productController.getProducts)
router.get("/products/:productId",productController.getProductbyId)
router.put("/products/:productId",productController.updateProduct)
router.delete("/products/:productId",productController.deleteProduct)

/*******************************Cart Api *******************************/

router.post("/users/:userId/cart", middleWare.userAuth, cartController.createCart)
router.put("/users/:userId/cart", middleWare.userAuth, cartController.updateCart)
router.get("/users/:userId/cart", middleWare.userAuth, cartController.getCart)
router.delete("/users/:userId/cart", middleWare.userAuth, cartController.deleteCart)

/*******************************Order Api *******************************/

router.post("/users/:userId/orders", middleWare.userAuth, orderController.createOrder)
router.put("/users/:userId/orders", middleWare.userAuth, orderController.updateOrder)





module.exports = router;

