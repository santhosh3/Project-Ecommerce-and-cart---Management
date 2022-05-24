const userModel = require("../model/userModel")
const validator = require("../validator/validation")
const aws = require("../aws/aws")
const bcrypt = require("bcrypt")

let createUser = async (req,res) =>{
    try {
        // extract data and file from RequestBody
        let data = req.body
        let files = req.files

        // Object Destructing
        // let { fname, lname, email, phone, password, address} = data

        // checking if user does not enters any data
        if (Object.keys(data) == 0) { return res.status(400).send({status:false,message:"No data provided"})}

        // checking files are coming or not
        if ( files && files.length > 0){
            let uploadFileUrl = await aws.uploadFile(files[0])
            data.profileImage = uploadFileUrl
            console.log(data.profileImage)
        }
        else{"please provide the image"}

        // checking for fname 
        if (!(validator.isValid(data.fname))) { return res.status(400).send({status:false, message:"please enter first name"}) }

        // checking for fname 
        if (!(validator.isValid(data.lname))) { return res.status(400).send({status:false, message:"please enter last name"}) }

        // checking for email
        if (!(validator.isValid(data.email))) { return res.status(400).send({status:false, message:"please enter email"}) }
        if (!(validator.isEmailValid(data.email))) { return res.status(400).send({status:false, message:"please enter valid Email"}) }

        const duplicateEmail = await userModel.findOne({email : data.email});
        if(duplicateEmail) {return res.status(400).send({status:false, message:"Email is already exist"})};

        // checking for phone
        if (!(validator.isValid(data.phone))) { return res.status(400).send({status:false, message:"please enter phone no."}) }

        if (!(validator.isPhoneValid(data.phone))) { return res.status(400).send({status:false, message:"please enter valid phone"}) }

        const duplicatePhone = await userModel.findOne({phone:data.phone});
        if(duplicatePhone) {return res.status(400).send({status:false, message:"phone is already exist"})};

        // checking for password
        if (!data.password) return res.status(400).send({ status: false, message: "please enter password"})
        if(data.password.trim().length<8 || data.password.trim().length>15) {return res.status(400).send({ status: false, message: 'Password should be of minimum 8 characters & maximum 15 characters' })}

        // using bcrypt
        const rounds = 10;
         let hash = await bcrypt.hash(data.password, rounds);
         data.password = hash;

        // checking for address
        let address = JSON.parse(data.address)
        data.address = address
         
        // for shipping address
        if (!(validator.isValid(address.shipping.street))) { return res.status(400).send({ status: true, message: " Street address is required" }) }

        if (!(validator.isValid(address.shipping.city))) { return res.status(400).send({ status: true, message: " city address is required" }) }

        if (!(validator.isValid(address.shipping.pincode))) { return res.status(400).send({ status: true, message: " pincode address is required" }) }

        if (!(validator.isValidPincode(address.shipping.pincode))) { return res.status(400).send({status:false, message:"Please provide pincode in 6 digit number"})}

        // for billing address

        if (!(validator.isValid(address.billing.street))) { return res.status(400).send({ status: true, message: " Street address is required" }) }

        if (!(validator.isValid(address.billing.city))) { return res.status(400).send({ status: true, message: " city address is required" }) }

         if (!(validator.isValid(address.billing.pincode))) { return res.status(400).send({ status: true, message: " pincode address is required" }) } 
         
         if (!(validator.isValidPincode(address.billing.pincode))) { return res.status(400).send({ status: true, message: " pincode address is required" }) }


        let result = await userModel.create(data)
          res.status(200).send({status:true, message:"User created successfully", data:result})
        }
    catch(error){
        res.status(500).send({status:false, message:error.message})
    }
}




module.exports = {createUser}

