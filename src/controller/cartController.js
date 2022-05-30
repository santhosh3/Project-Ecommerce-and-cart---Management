const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const validator = require("../validator/validation")
const { validate } = require("../model/userModel")

/*********************************** Create Cart ************************************/


const createCart = async (req,res) => {
  
    try{
        const userId = req.params.userId
        const data = req.body

        //checking for valid input
        if (Object.keys(data).length == 0) { return res.status(400).send({status:false, message:"please provide data"}) }

        data.userId = userId

          // AUTHORISATION
          if(userId !== req.userId) {
            return res.status(401).send({status: false, message: "Unauthorised access"})
        }

        // checking if userId exist or not 
        const cartCheck = await cartModel.findOne({userId:userId})

        if(!cartCheck) {
            // checking items in data 
            if (data.items.length == 0) return res.status(400).send({status:false, message:"Product quantity should be 1"})

            // validating items in data
            for (let i=0; i<data.items.length; i++){
                if(!validator.isValidObjectId(data.items[i].productId)) return res.status(400).send({status: false, message: `Product-Id for ${i+1} product is invalid`})

                // checking if product exist or not
                let productCheck = await productModel.findOne({_id: data.items[i].productId, isDeleted:false})

                if(!productCheck) return res.status(404).send({status:false,message:`Product-Id for ${i+1} product doesn't exist`})//index value checking if zeroth product shuold not considerd

                
                //validating the quantity of product
                if (validator.isValid(data.items[i].quantity)) return res.status(400).send({status:false,message:"enter a valid value for quantity"})

                if (!validator.isValidNum(data.items[i].quantity)) return res.status(400).send({ status: false, message: "Quantity of product should be in numbers" })

                if (data.totalPrice == undefined){
                    data.totalPrice = 0;
                }
                data.totalPrice += productCheck.price * data.items[i].quantity
            }
            data.totalItems = data.items.length
            await cartModel.create(data);

            let resData = await cartModel.findOne({userId}).populate('items.productId')
            return res.status(201).send({ status: true, message: "Products added to the cart", data: resData })
        }

        if(!validator.isValidObjectId(data.cartId)) return res.status(400).send({status: false, message: "Cart-Id is required and should be valid"})

        if (cartCheck._id.toString() !== data.cartId) return res.status(400).send({ status: false, message: "CartId not matched" })

        if(data.items.length == 0) return res.status(400).send({ status: false, message: "Product's quantity should be at least 1" });

        let tempCart = cartCheck;

        //validating items in data
        for(let i = 0; i < data.items.length; i++){
          if(!validator.isValidObjectId(data.items[i].productId)) return res.status(400).send({ status: false, message: `Product-Id for ${i+1} product is invalid` });
    
          //checking if product exist and not been deleted
          let checkProduct = await productModel.findOne({_id: data.items[i].productId, isDeleted: false});
          if(!checkProduct) return res.status(404).send({ status: false, message: `Product-Id for ${i+1} product doesn't exist` });
    
          //validating the quantity of product
          if(validator.isValid(data.items[i].quantity)) return res.status(400).send({ status: false, message: "Enter a valid value for quantity" });
          if(!validator.isValidNum(data.items[i].quantity)) return res.status(400).send({ status: false, message: "Quantity of product should be in numbers" });
    
          //check if productId already exist in database or not
          tempCart.items.map(x => {
            if(x.productId.toString() == data.items[i].productId) {
              x.quantity += data.items[i].quantity;
              tempCart.totalPrice += checkProduct.price * data.items[i].quantity
            }
          })    
          
          //check for the product that doesn't exist in the items
          let checkProductId = await cartModel.findOne({_id: data.cartId, 'items.productId': {$in: [data.items[i].productId]}})
          if(!checkProductId) {
            tempCart.items.push(data.items[i]);
            tempCart.totalPrice += checkProduct.price * data.items[i].quantity
          }
        }
        tempCart.totalPrice = tempCart.totalPrice.toFixed(2);//removes extra decimal numbers 54.3325626 = 54

        tempCart.totalItems = tempCart.items.length
    
        let updateCart = await cartModel.findByIdAndUpdate(
          {_id: data.cartId},
          tempCart,
          {new: true}
        ).populate('items.productId')
        res.status(200).send({ status: true, message: "Products added to the cart", data: updateCart })
      } 
        
    catch(error){
        res.status(500).send({status:false,message:error.message})
    }

}


const updateCart = async (req,res)=>{
    try{
        const userId = req.params.userId
        const data = req.body
        const {cartId,productId,removeProduct} = data

        // checking data coming or not in req body
        if (Object.keys(data).length == 0) { return res.status(400).send({status:false, message:"please provide data"}) }

        // checking for valid userId
        if(!validator.isValidObjectId(userId)){
            return res.status(400).send({ status: false, msg: "UserId is Invalid"})
        }

        if(req.userId != userId){
            return res.status(400).send({ status: false, msg: "You are not authorize."})
        }
       
        // checking for valid carId 
        if (!validator.isValid(cartId)) { return res.status(400).send({status:false, message:"please provide  cardId"}) }

        if (!validator.isValidObjectId(cartId)) { return res.status(400).send({status:false, message:"please provide valid CartId"}) }

        // checking for product Id 
        if (!validator.isValid(productId)) { return res.status(400).send({status:false, message:"please provide  productId"}) }

        if (!validator.isValidObjectId(productId)) { return res.status(400).send({status:false, message:"please provide valid productId"}) }

        // checking for 
        if (!validator.isValid(removeProduct)) { return res.status(400).send({status:false, message:"please enter what produvt ypu want to remove"}) }

        // finding cart by using findById method
        const findCartByID = await cartModel.findById({_id: cartId})

        if(!findCartByID) { return res.status(400).send({status:false, message:"opps! cart not found"})}

        // checking that cart is empty or not
        if(findCartByID.totalItems == 0 && findCartByID.totalPrice == 0) { return res.status(400).send({status:false,message:"cart is empty"})}

        // finding user by using findOne method
        const findUser = await userModel.findOne({_id:userId, isDeleted: false})

        if (!findUser) {return res.status(404).send({status:false,message:"Opps! we can't find any user with this input"}) }

        // checking uesrId
        const cartMatch = await cartModel.findOne({userId:userId})
        
        if (!cartMatch) { return res.status(401).send({status:false,message})}

        //  checking that product is present in our data-base
        const product = await productModel.findOne({_id:productId, isDeleted:false})

        if (!product) { return res.status(404).send({status:false,message:"Opps! Product not found"})}

        // let's remove the product from the cart
        if(removeProduct == 0){
            for(let i = 0; i<findCartByID.items.length; i++){
                if (findCartByID.items[i].productId == productId){
                    let initialPrice = product.price*findCartByID.items.quantity
                    let updatedPrice = findCartByID.totalPrice - initialPrice
                    findCartByID.items.splice(i, 1)
                    let updatedItems = findCartByID.totalItems -1

                    let updatedPriceAndItems = await cartModel.findOneAndUpdate({userId:userId},{items:findCartByID.items,totalPrice:updatedPrice,totalItems:updatedItems},{new:true})
                        return res.status(200).send({status:true,message:"successfully Updated data",data:updatedPriceAndItems})
                }
                else if( removeProduct == 1){
                    for(let i = 0; i<findCartByID.items.length; i++){
                        if (findCartByID.items[i].productId == productId){
                            let updateQuantity = findCartByID.items[i].quantity - 1
                            if(updateQuantity < 1){
                                let updatedItems = findCartByID.totalItems - 1
                                let productPrice = product.price * findCartByID.items[i].quantity
                                let updatedPrice = findCartByID.totalPrice - productPrice
                                findCartByID.items.splice(i,1)

                                let updatedPriceAndItems = await cartModel.findOneAndUpdate({userId:userId},{items:findCartByID.items,totalPrice:updatedPrice,totalItems:updatedItems},{new:true})
                                    return res.status(200).send({status:true,message:"successfully Updated data",data:updatedPriceAndItems}) 
                            }
                            else{
                                findCartByID.items[i].quantity = updateQuantity
                                let updatedPrice = findCartByID.totalPrice - ([product.price * 1])
                                let updatedPriceAndItems = await cartModel.findOneAndUpdate({userId:userId},{items:findCartByID.items,totalPrice:updatedPrice,totalItems:updatedItems},{new:true})
                                    return res.status(200).send({status:true,message:"successfully Updated data",data:updatedPriceAndItems})
                            }
                        }

                    }
                 
                }
            }
        }

    }
    catch(error){
        res.status(500).send({status:false,message:error.message})
    }
}

const getCart = async (req,res) => {
    try{
        // Validate params
        userId = req.params.userId
        if(!validator.isValidObjectId(userId)) {
            return res.status(400).send({status: false, message: `${userId} is invalid`})
        }

        // AUTHORISATION
        if(userId !== req.userId) {
            return res.status(401).send({status: false, message: "Unauthorised access"})
        }

        // to check user present or not
        const userSearch = await userModel.findById({_id:userId})
        if(!userSearch) {
            return res.status(400).send({status: false, message: "userId does not exist"})
        }


        // To check cart is present or not
        const cartSearch = await cartModel.findOne({userId:userId})
        if(!cartSearch) {
            return res.status(400).send({status: true, message: "UserId does not exist"})
        }
        return res.status(200).send({status: true, message: "Success", data: cartSearch})

    }
    catch (error) {
        console.log("This is the error :", err.message)
        res.status(500).send({ message: "Error", error: error.message })
    }
}

const deleteCart = async function(req,res) {
    try{
         // Validate params
         userId = req.params.userId
         if(!validator.isValidObjectId(userId)) {
            return res.status(400).send({status: false, message: `${userId} is invalid`})
         }
          // AUTHORISATION
        if(userId !== req.userId) {
            return res.status(401).send({status: false, message: "Unauthorised access"})
        }
        //  To check user is present or not
        const userSearch = await userModel.findById({ _id: userId})
        if(!userSearch) {
            return res.status(404).send({status: false, message: "User doesnot exist"})
        }
       
        // To check cart is present or not
        const cartSearch = await cartModel.findOne({userId:userId})
        if(!cartSearch) {
            return res.status(404).send({status:false, message: "cart doesnot exist"})
        }

        const cartdelete = await cartModel.findOneAndUpdate({userId}, {items:[], totalItems:0, totalPrice:0}, {new: true})
        res.status(200).send({status: true, message:"Cart deleted"})

    }
    catch (error) {
        console.log("This is the error :", error.message)
        res.status(500).send({status:false, message: "Error", error: error.message })
    }
}

module.exports = { createCart,updateCart,getCart, deleteCart}