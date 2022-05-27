const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const validator = require("../validator/validation")

/*********************************** Create Cart ************************************/

const createCart = async function(req, res){
    try{
        const userIdFromParams = req.params.userId;
        const data = req.body

        if(Object.keys(data).length ==0){return res.status(400).send({status:false, message: "please input some data"})}

        if(!validator.isValidObjectId(userIdFromParams)){
            return res.status(400).send({ status: false, msg: "UserId is Invalid"})
        }

        const { userId, items: { productId, quantity }} = data

        if(!validator.isValidObjectId(userId)){
            return res.status(400).send({ status: false, msg: "UserId is Invalid"})
        }

        if(req.userId != userIdFromParams){
            return res.status(400).send({ status: false, msg: "You are not authorize."})
        }

        const user = await userModel.findById(userIdFromParams)
        if(!user){ 
            return res.status(400).send({ status: false, msg: "User not found"})
        }

        
        if(!validator.isValid(data.items.productId)){
            return res.status(400).send({ status: false, msg: "Please provide ProductId"})
        } 

        if(!validator.isValidObjectId(data.items.productId)){
            return res.status(400).send({ status: false, msg: "productId is Invalid"})
        }

        const findProduct = await productModel.findOne({_id: productId, isDeleted: false})

        if(!findProduct){
            return res.status(400).send({ status: false, msg: "Product not found"})
        }

        if(!validator.isValid(quantity)){
            return res.status(400).send({ status: false, msg: "Please provide quantity"})
        }

        if(isNaN(Number(quantity))){
            return res.status(400).send({ status: false, msg: "Quantity should be a valid number"})
        }

        if(quantity < 0){
            return res.status(400).send({ status: false, msg: "Quantity can not be less than zero"})
        }

        const userOne = await cartModel.findOne(userIdFromParams)

        if(!userOne){
            const newCart = {
                userId: userIdFromParams,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                totalPrice: ( findProduct.price)*quantity,
                totalItems: 1
            }

            const saveCart = await cartModel.create(newCart)
            return res.status(201).send({status: true, msg: "Cart created successfully", data: saveCart})
        }

         if(userOne){
            const newTotalPrice = (userOne.totalPrice) + ((findProduct.price)*quantity)
            const items = userOne.items
            const length = items.length
            for(let i = 0; i<length; i++){
                if(items[i].productId == productId)
                items[i].quantity = quantity+1
            }
            let newCartOne = {
                items: items,
                totalPrice: totalPrice,
                totalItems: length
            }

            const data = await cartModel.findOneAndUpdate({userId: userIdFromParams}, newCartOne, {new: true})

            return res.status(201).send({ status: true, msg: "Product added to the cart successfully", data: data})
        } 
        let totalItems = userOne.totalItems + 1
        items.push({ productId: productId, quantity: quantity })

        const savedCart = await cartModel.findOneAndUpdate({ _id: userOne})
    }

    catch(error){

    }
}



module.exports = { createCart }