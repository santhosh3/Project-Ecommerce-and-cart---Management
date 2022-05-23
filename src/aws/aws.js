const aws = require("aws-sdk")

// configuration for aws 
aws.config.update({
    accessKeyId:"",
    secretAccessKey:"",
    region:""
});

/*********************************************************************************************************************************************** */
//PROMISES:-
// -you can never use await on callback..if you awaited something , then you can be sure it is within a promise
// -how to write promise:- wrap your entire code inside: "return new Promise( function(resolve, reject) { "...and when error - return reject( err )..else when all ok and you have data, return resolve (data)

/*********************************************************************************************************************************************** */

const uploadFile = async (file) =>{
    return new Promise(function(resolve,reject){
        let s3= new AWS.S3({apiVersion: '2006-03-01'}); //We use this syntax as mandotory for aws-s3

        let uploadParams = {
            ACL : "public-read",
            Bucket: "classroom-training-bucket",
            Key: "abc/" + file.originalname,
            Body: file.buffer 
        }
        s3.upload(uploadParams, function(err,data){
            if(err) {
              console.log(err)
              return reject({ "error": err })
            }
            return resolve(data.Location)
          })
    })
}

module.exports = {uploadFile}