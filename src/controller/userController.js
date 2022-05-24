const userModel = require("../model/userModel")

let createUser = async (req,res) =>{
    try {
        // extract data and file from RequestBody
        let data = req.body
        let files = req.files

        // Object Destructing
        let { fname, lname, email, phone, password} = data

        // checking if user does not enters any data
        if (Object.keys(data) == 0) { return res.status(400).send({status:false,message:"No data provided"})}

        // checking files are coming or not
        if ( files && files.length > 0){
            let uploadFileUrl = await uploadFile(file[0])
            data.profileImage = uploadFileUrl
        }

        

        
        let result = await userModel.create(data)
        res.status(200).send({status:true, message:"User created successfully", data:result})
        }
    catch(error){
        res.status(500).send({status:false, message:error})
    }
}