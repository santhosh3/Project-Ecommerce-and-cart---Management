const productModel = require("../model/productModel")
const aws = require("../aws/aws")
const validator = require("../validator/validation")



const createProduct = async function (req, res) {
      try {
          let data = req.body
          let files = req.files
        
        // checking data comes from user body
        if(Object.keys(data).length ==0){return res.status(400).send({status:false, message: "please input some data"})}
          const { title, description, price, currencyId, currencyFormat, availableSizes, installments} = data
        
        // checking for title
        if(!(validator.isValid(title))){
             return res.status(400).send({status:false, message:"title required"})
          }
        // checking duplicate title
        let duplicateTitle = await productModel.findOne({title:title})
        if(duplicateTitle){
             return res.status(400).send({status:false, message: "title already exist in use"})
          }
        //checking for description
        if(!(validator.isValid(description))){
             return res.status(400).send({status:false, message:"description required"})
          }
        //checking for price
        if(!(validator.isValid(price))){
            return res.status(400).send({status:false, message: "price required"})
          }
          
          if(price){
            if (!(validator.isValidPrice(price))) {
                return res.status(400).send({ status: false, message: "Invalid price" })
            }
            }  

         //checking for currencyId
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
        if(!(validator.isValid(availableSizes))) {
            return res.status(400).send({status:false, message: "availableSizes required"})
          }

/*         if(validator.isValid(availableSizes) && validator.isValidString(availableSizes))  return res.status(400).send({ status: false, message: "Enter at least one available size" }); */

        /*let sizeArray = availableSizes.split(",").map(x => x.trim())
        for (let i = 0; i < sizeArray.length; i++) {
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizeArray[i]))) {
                return res.status(400).send({ status: false, message: `Available Sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
            }
        } */


        data.availableSizes =  JSON.parse(availableSizes);

        for(let i = 0;  i < data.availableSizes.length; i++){
             if(!validator.isValidSize(data.availableSizes[i])) {
        return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })
             }
         }         
         if(!(validator.isValid(installments))) {
            return res.status(400).send({status:false, message: "Invalid request parameters Please enter number"})
         }

         if (installments) {
            if (!(validator.isValidInstalments(installments))) {
                return res.status(400).send({ status: false, message: "Invalid installments" })
            }
        }
    
        if(data.isDeleted === true) {
          return res.status(400).send({status:false, message:"Bad Request"})//not working 
         }
  
         const created = await productModel.create(data)
         return res.status(201).send({ status: true, message:"Success",data: created })
      }
      catch (err) {
          return res.status(500).send({ status: false, message: err.message })
      }
  }

  const getProducts = async (req, res) => {
    try{
        const filterQuery = { isDeleted: false }
        const queryParams = req.query
    
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams

        if (size) {
            if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(size) == -1)  return res.status(400).send({ status: false, message: `Size should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
            filterQuery['availableSizes'] = size
        }
    
        if (name) {
            if (!validator.isValid(name)) return res.status(400).send({ status: false, message: 'name is invalid' })
            filterQuery['title'] = name
        }
    
        if (priceGreaterThan && priceLessThan) {
            console.log("both given");
            filterQuery['price'] = { $gte: priceGreaterThan, $lte: priceLessThan }
        }
    
        if (priceGreaterThan) {
            console.log("only 1 given");
            filterQuery['price'] = { $gte: priceGreaterThan }
        }
    
        if (priceLessThan) {
            console.log("only 2 given");
            filterQuery['price'] = { $lte: priceLessThan }
        }

    
        if (priceSort) {
            if (priceSort == 1) {
                const products = await productModel.find(filterQuery).sort({ price: 1 })
                if(Object.keys(products).length ==0){return res.status(400).send({status:false, message: "No product found"})}
                return res.status(200).send({ status: true, message: 'Success', data: products })
            }
            if (priceSort == -1) {
                const products = await productModel.find(filterQuery).sort({ price: -1 })
                if(Object.keys(products).length ==0){return res.status(400).send({status:false, message: "No product found"})}

                return res.status(200).send({ status: true, message: 'Success', data: products })

            }
            else{
                return res.status(400).send({status:false, message:"please provide 1 or -1"})
            }
        }
        const products = await productModel.find(filterQuery)
        if(Object.keys(products).length ==0){return res.status(400).send({status:false, message: "No product found"})}
        return res.status(200).send({ status: true, message: "Success", data: products })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ Error: err.message })
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
            return res.status(200).send({ status: true, message: 'Success', data: findProduct })
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

        const { title, description, price, currencyId, currencyFormat, installments,availableSizes, isFreeShipping } = data

        const dataObject = {};

        if (!(validator.isValidObjectId(productId))) {
            return res.status(400).send({ status: false, message: "productId is invalid" });
        }
       
        const findProduct = await productModel.findById(productId)

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product does not exists' })
        }

        if(findProduct.isDeleted == true){
            return res.status(400).send({ status:false, message: "product is deleted" });
        }

        if (Object.keys(data).length == 0) { 
            return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }); 
        } 
        
    if(title){    
        if (!(validator.isValid(title))) {
            return res.status(400).send({status:false, message: "Please enter discription"})
        }
    
        let title1 = await productModel.findOne({title:title})
        if(title1) {
            return res.status(400).send({status:false, message: "title already exist in use"})
        }
        dataObject['title'] = title
    }

    if(description) {
        if (!(validator.isValid(description))) {
            return res.status(400).send({status:false, message: "Please enter discription"})
        }
            dataObject['description'] = description
    }    
        
    if(price){
        if (!(validator.isValid(price)))  {
            return res.status(400).send({status:false, message: "Please enter price"})
        }    
        if(price){
            if (!(validator.isValidPrice(price))) {
                return res.status(400).send({ status: false, message: "Invalid price" })
            }
        }  
            dataObject['price'] = price
    }  
    if(currencyId){      
        if (!(validator.isValid(currencyId))) {
            return res.status(400).send({status:false, message: "Please enter currencyId"})
        }
        dataObject['currencyId'] = currencyId
    } 
    if(currencyFormat){
        if (!(validator.isValid(currencyFormat)))  {
            return res.status(400).send({status:false, message: "Please enter currencyFormat"})
        }
        dataObject['currencyFormat'] = currencyFormat
    }    

        let files = req.files
        if (files && files.length > 0) {
            let uploadFileUrl = await aws.uploadFile(files[0])
            dataObject['productImage'] = uploadFileUrl
        }
     if(availableSizes){ 
        if(validator.isValid(availableSizes) && validator.isValidString(availableSizes))  return res.status(400).send({ status: false, message: "Enter at least one available size" });

        data.availableSizes =  JSON.parse(availableSizes);

        for(let i = 0;  i < data.availableSizes.length; i++){
            if(!validator.isValidSize(data.availableSizes[i])) {
              return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })
            }
            dataObject["availableSizes"]=data.availableSizes
        } 
    }   
        
        if (installments) {
            if (!(validator.isValidInstalments(installments))) {
                return res.status(400).send({ status: false, message: "Invalid installments" })
            }
            dataObject["installments"]=installments
        }

        if(isFreeShipping) {
            if(validator.isValid(isFreeShipping)){
                dataObject["isFreeShipping"] = isFreeShipping
            }
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
        if (!(validator.isValidObjectId(productId))) {
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

        return res.status(200).send({ status: true, message: 'Product deleted successfully.' })
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = {createProduct, getProductbyId, getProducts,updateProduct,deleteProduct}