const orderModel = require('../model/orderModel')
const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const validator = require("../validator/validation")
const cartModel = require('../model/cartModel')

/******************************** create order ***************************/

const createOrder = async function(req,res) {
    try{
        const body = req.body
        console.log(body.userId)
        if (Object.keys(body) == 0) {
            return res.status(400).send({status: false,message: "please provide data"})
        }

        if(body.userId !== req.userId){ return res.status(400).send({status:false, message:"please provide valid UserId"}) }

        const userId = req.params.userId;
        if(!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters"});
        }

        if(userId !== req.userId) {
            return res.status(401).send({status: false, msg: "Unauthorised access"})
        }

        const {cartId, cancellable, status, isDeleted} = body

        if(!validator.isValid(body.userId)) {
            return res.status(400).send({status: false, msg: "userId must be present"})
        }

        if(!validator.isValidObjectId(body.userId)) {
            return res.status(400).send({status: false, msg: "Invalid userId"})
        }

        if(!validator.isValid(cartId)) {
            return res.status(400).send({status: false, msg: "cartId must be present"})
        }

        if(!validator.isValidObjectId(cartId)) {
            return res.status(400).send({status: false, msg: "Invalid cartId"})
        }

        if(isDeleted == true) {
            return res.status(400).send({status: false, msg: "Bad request"})
        }

        const userSearch = await userModel.findOne({_id: userId})
        if(!userSearch) {
            return res.status(400).send({status: false, msg: "User does not exist"})
        }

        const cartSearch = await cartModel.findOne({userId:userId}).select({items:1, totalPrice:1, totalItems:1, userId:1})
        if(!cartSearch) {
            return res.status(400).send({status: false, msg: "Cart does not exist"})
        }
        console.log(cartSearch.userId)
        if(cartSearch.userId != req.userId) {
            return res.status(400).send({status:false, msg: "Unauthorised access u need to enter your userId"})
        }

        if (cancellable) {
            if (!(typeof (cancellable) == 'boolean')) {
                return res.status(400).send({ status: false, message: "Cancellable must be a boolean value" });
            }
        }

        if(status) {
            if (['pending', 'completed', 'cancelled'].indexOf(status) == -1) {
                return res.status(400).send({status: false, msg: "Order status by default is pending"})
            }
        }

        let totalQuantity = 0

        let itemsArr = cartSearch.items
        for (let i in itemsArr) {
            totalQuantity += itemsArr[i].quantity
        }


        let order = { userId: userId, items: cartSearch.items, totalPrice: cartSearch.totalPrice, totalItems: cartSearch.totalItems, totalQuantity: totalQuantity, cancellable, status}

        let createdOrder = await orderModel.create(order)
        return res.status(201).send({status: true, msg: "Successfully created Order", data: createdOrder})
    }
    catch (error) {
        res.status(500).send({ msg: "Error", error: error.message })
    }
}

module.exports = { createOrder }