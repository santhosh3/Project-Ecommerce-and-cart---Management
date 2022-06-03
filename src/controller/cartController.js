const userModel = require("../model/userModel")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const validator = require("../validator/validation")

/*********************************** Create Cart ************************************/

/* const createCart = async (req,res) => {
  
    try{
        const userId = req.params.userId
        const data = req.body

        //checking for valid input
        if (Object.keys(data).length == 0) { return res.status(400).send({status:false, message:"please provide data"}) }


          // AUTHORISATION
           if(userId !== req.userId) {
            return res.status(403).send({status: false, message: "Unauthorised access"})
        }
        if(data.userId !== req.userId){ return res.status(400).send({status:false, message:"please provide valid UserId"}) }
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
                // 0 = 0 + 40 * 2 => 80
            }
            data.totalItems = data.items.length
            await cartModel.create(data);

            let resData = await cartModel.findOne({userId})  //.populate('items.productId')
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
                console.log(x.productId.toString())
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
        ).select({_id: 0})
        res.status(200).send({ status: true, message: "Products added to the cart", data: updateCart })
      } 
        
    catch(error){
        res.status(500).send({status:false,message:error.message})
    }

} */

let createCart = async function (req, res) {
    try {
      const userId = req.params.userId;
      const idFromToken = req.userId
  
      if (!validator.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Enter a valid userId" });
      }
  
      const user = await userModel.findOne({ _id: userId });
      if (!user) {
        return res.status(404).send({ status: false, message: "User not found" });
      }
  
      if (userId != idFromToken) {
        return res.status(403).send({ status: false, message: "User not authorized" })
      }
  
      const requestBody = req.body;

      if (Object.keys(requestBody) == 0) { return res.status(400).send({status:false,message:"No data provided"})}
  
      const { cartId, productId } = requestBody;
  
      if (!validator.isValid(productId)) {
        return res.status(400).send({ status: false, message: "enter the productId" });
      }
  
      if (!validator.isValidObjectId(productId)) {
        return res.status(400).send({ status: false, message: "enter a valid productId" });
      }
  
      const product = await productModel.findOne({ _id: productId, isDeleted: false });
  
      if (!product) {
        return res.status(404).send({ status: false, message: "product not found" });
      }
  
      if (!cartId) {
        const cartAlreadyPresent = await cartModel.findOne({ userId: userId });
        if (cartAlreadyPresent) {
          return res.status(404).send({ status: false, message: "cart already exist" });
        }
        newCart = {
          userId: userId,
          items: [{
            productId: productId,
            quantity: 1
          }],
          totalPrice: product.price,
          totalItems: 1,
        };
  
        newCart = await cartModel.create(newCart);
  
        return res.status(201).send({ status: true, message: "Success", data: newCart });
      }
      
      if (cartId) {
        if (!validator.isValidObjectId(cartId)) {
          return res.status(400).send({ status: false, message: "enter a valid cartId" });
        }
  
        const cartAlreadyPresent = await cartModel.findOne({ _id: cartId, userId: userId });
        if (!cartAlreadyPresent) {
          return res.status(400).send({ status: false, message: "Cart does not exist" });
        }
        
        let totalPrice = product.price
        if (cartAlreadyPresent) {
  
          totalPrice += cartAlreadyPresent.totalPrice;
  
          let itemsArr = cartAlreadyPresent.items
          for (i in itemsArr) {
            if (itemsArr[i].productId.toString() === productId) {
              itemsArr[i].quantity += 1
  
              let updatedCart = { items: itemsArr, totalPrice: totalPrice, totalItems: itemsArr.length }
  
              let responseData = await cartModel.findOneAndUpdate({ userId: userId }, updatedCart, { new: true })
  
              return res.status(201).send({ status: true, message: `Success`, data: responseData })
            }
          }
          itemsArr.push({ productId: productId, quantity: 1 })
  
          let updatedCart = { items: itemsArr, totalPrice: totalPrice, totalItems: itemsArr.length }
          let responseData = await cartModel.findOneAndUpdate({ userId: userId }, updatedCart, { new: true })
  
          return res.status(201).send({ status: true, message: 'Success', data: responseData })
        }
      }
    }

    catch (error) {
      return res.status(500).send({ status: false, message: error.message })
    }
  }

const updateCart = async function(req,res) {
    try{
        const body = req.body
        const userId = req.params.userId;

        if(Object.keys(body) == 0){
            return res.status(400).send({ status: false, msg: "Please provide data to update."});
        }

        if(!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid parameters"});
        }

        const userSearch = await userModel.findById({_id:userId})
        if(!userSearch) {
            return res.status(400).send({status: false, msg: "userId does not exist"})
        }

        if(userId !== req.userId) {
            return res.status(401).send({status: false, msg: "Unauthorised access"})
        }

        const {cartId, productId, removeProduct} = body

        if(!validator.isValid(cartId)) {
            return res.status(400).send({status: false, msg: "CartId is required"})
        }

        if(!validator.isValidObjectId(cartId)) {
            return res.status(400).send({status: false, msg: "Invalid cartId"})
        }

        if(!validator.isValid(productId)) {
            return res.status(400).send({status: false, msg: "productId is required"})
        }

        if(!validator.isValidObjectId(productId)) {
            return res.status(400).send({status: false, msg: "Invalid productId"})
        }

        const cartSearch = await cartModel.findOne({_id: cartId})
        if(!cartSearch) {
            return res.status(404).send({status: false, msg: "Cart does not exist"})
        }

        const productSearch = await productModel.findOne({ _id: productId})
        if(!productSearch) {
            return res.status(404).send({status: false, msg: "product does not exist"})
        }

        if(productSearch.isDeleted == true) {
            return res.status(400).send({status: false, msg: "Product is already deleted"})
        }

        if((removeProduct != 0) && (removeProduct != 1)) {
            return res.status(400).send({status: false, msg: "Invalid remove product"})
        }


        const cart = cartSearch.items
        for(let i=0; i<cart.length; i++) {
            if(cart[i].productId == productId) {
                const priceChange = cart[i].quantity * productSearch.price
                if(removeProduct == 0) {
                    const productRemove = await cartModel.findOneAndUpdate({_id: cartId}, {$pull: {items:{productId: productId}}, totalPrice: cartSearch.totalPrice-priceChange, totalItems:cartSearch.totalItems-1}, {new:true})
                    return res.status(200).send({status: true, message: 'Success', data: productRemove})
                }

                if(removeProduct == 1) {
                    if(cart[i].quantity == 1 && removeProduct == 1) {
                     const priceUpdate = await cartModel.findOneAndUpdate({_id: cartId}, {$pull: {items: {productId: productId}}, totalPrice:cartSearch.totalPrice-priceChange, totalItems:cartSearch.totalItems-1}, {new: true})
                     return res.status(200).send({status: true, message: 'Success', data: priceUpdate})
                }

                cart[i].quantity = cart[i].quantity - 1
                const updatedCart = await cartModel.findByIdAndUpdate({_id: cartId}, {items: cart, totalPrice:cartSearch.totalPrice - productSearch.price}, {new: true})
                return res.status(200).send({status: true, message: 'Success', data: updatedCart})
                }
            }
           return res.status(400).send({ status: false, message: "Product does not found in the cart"})
        }
        
    }
    catch (error) {
        console.log("This is the error :", error.message)
        res.status(500).send({ msg: "Error", error: error.message })
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