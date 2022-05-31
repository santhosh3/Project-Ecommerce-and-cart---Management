const orderModel = require('../model/orderModel')
const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const validator = require("../validator/validation")

/******************************** create order ***************************/


module.exports = { createOrder }