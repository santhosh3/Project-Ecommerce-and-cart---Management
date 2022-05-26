const productModel = require("../model/productModel")
const aws = require("../aws/aws")
const mongoose = require("mongoose")
const validator = require("../validator/validation")



const createProduct = async function (req, res) {
      try {
          let data = req.body
          let files = req.files
        
        if(Object.keys(data).length ==0){return res.status(400).send({status:false, message: "please input some data"})}
          const { title, description, price, currencyId, currencyFormat, availableSizes, installments} = data
  
        if(!(validator.isValid(title))){
             return res.status(400).send({status:false, message:"title required"})
          }
  
        let duplicateTitle = await productModel.findOne({title:title})
        if(duplicateTitle){
             return res.status(400).send({status:false, message: "title already exist in use"})
          }
          
        if(!(validator.isValid(description))){
             return res.status(400).send({status:false, message:"description required"})
          }
  
        if(!(validator.isValid(price))){
            return res.status(400).send({status:false, message: "price required"})
          }
  
        if(!(validator.isValid(currencyId))) {
            return res.status(400).send({status:false, message: "currencyId required"})
          }
  
        if(!(validator.isValid(currencyFormat))) {
          return res.status(400).send({status:false, message: "currency format required"})
         }
  
      
  
        if(currencyId != "INR"){ 
            return res.status(400).send({status:false, message: "only indian currencyId INR accepted"})
         }
  
        if(currencyFormat != "₹"){
            return res.status(400).send({status:false, message: "only indian currency ₹ accepted "})
         }
        if( files && files.length > 0){
              let image = await aws.uploadFile(files[0])
              data.productImage = image
         } else {
            return res.status(400).send({status:false,message: "please provide the productImage"})
         }
        
           //checking for available Sizes of the products
        if(validator.isValid(availableSizes) && validator.isValidString(availableSizes))  return res.status(400).send({ status: false, message: "Enter at least one available size" });

         data.availableSizes =  JSON.parse(availableSizes);

        for(let i = 0;  i < data.availableSizes.length; i++){
             if(!validator.isValidSize(data.availableSizes[i])) {
        return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })
             }
         }           
    
  
    //      if(!(validator.isValid(availableSizes))) {
    //       return res.status(400).send({status:false, message: "atleastOne size is required"})
    //      }
  
    //   if(!(validator.validForEnum(availableSizes))) {
    //     return res.status(400).send({status:false, message: "atleastOne size is required"})//not working
    //    }
    //    data.availableSizes=JSON.parse(availableSizes)
  
         if(!(validator.isValid(installments))) {
            return res.status(400).send({status:false, message: "Invalid request parameters Please enter number"})
         }
         if(data.isDeleted === true) {
          return res.status(400).send({status:false, message:"Bad Request"})//not working 
      }
  
         const created = await productModel.create(data)
         return res.status(201).send({ status: true, message:"data created successfully",data: created })
      }
      catch (err) {
          return res.status(500).send({ status: false, message: err.message })
      }
  }

const getProductbyId = async function (req, res) {
    try{
        const productId = req.params.productId

        if (!(validator.isValidObjectId(productId))) {
            return res.status(400).send({ status: false, message: "productId is invalid" });
        }
        const findProduct = await productModel.findOne({_id : productId, isDeleted : false})
        if (findProduct) { 
            return res.status(200).send({ status: true, message: 'Product found successfully', data: findProduct })
        }
        return res.status(404).send({ status: false, message: 'product does not exists' }) 
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

const updateProduct = async function (req, res) {

    try {
        let data = req.body;
        const productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is invalid" });
        }
       
        const findProduct = await productModel.findById(productId)

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product does not exists' })
        }

        if(findProduct.isDeleted == true){
            return res.status(400).send({ status:false, message: "product is deleted" });
        }

        if (!(Object.keys(data).length == 0)) { 
            return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }); 
        } 

        let { title, description, price, currencyId, currencyFormat, productImage,availableSizes } = data

        const dataObject = {};

        if (isValid(title)) {
            dataObject['title'] = title
        }
        let title1 = await productModel.findOne({title:title})
        if(title1) {
            return res.status(400).send({status:false, message: "title already exist in use"})
        }

        if (isValid(description)) {
            dataObject['description'] = description
        }

        if (isValid(price))  {
            dataObject['price'] = price
        }

        if (isValid(currencyId)) {
            dataObject['currencyId'] = currencyId
        }

        if (isValid(currencyFormat))  {
            dataObject['currencyFormat'] = currencyFormat
        }

        let files = req.files
        if (files && files.length > 0) {
            let uploadFileUrl = await aws.uploadFile(files[0])
            dataObject['productImage'] = uploadFileUrl
        }
  
        if (validForEnum(availableSizes))  {
            data.availableSizes = JSON.parse(availableSizes)
            dataObject['availableSizes'] = data.availableSizes
        }
        let updatedProduct = await productModel.findOneAndUpdate({_id:productId},dataObject,{ new: true })

        if(!updatedProduct) {
            return res.status(404).send({ status: false, message: "user profile not found" })
        }
        return res.status(200).send({ status: true, message: "User Profile updated", data: updatedProduct })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const deleteProduct = async function (req, res) {
    try{
        const productId = req.params.productId
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is invalid" });
        }
        const findProduct = await productModel.findById(productId);
        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product does not exists' })
        }
        if (findProduct.isDeleted == true){
            return res.status(400).send({status:false, message:"product already deleted."})
        }
        const deletedDetails = await productModel.findOneAndUpdate({ _id: productId },{ $set: { isDeleted: true, deletedAt: new Date() } }, {new:true})

        return res.status(200).send({ status: true, message: 'Product deleted successfully.', data:deletedDetails })
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {createProduct,getProductbyId,updateProduct,deleteProduct}