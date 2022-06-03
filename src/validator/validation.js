const { default: mongoose } = require("mongoose"); 
//@ts-check
const isValid = function (value){
    if (typeof (value) === "undefined" || typeof (value) === null) {return false}
    if (typeof (value) === "string" && value.trim().length == 0) {return false} 
    return true 
}

// The test() method executes a search for a match between a regular expression and a specified string. Returns true or false.

const isEmailValid = function (email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

const isPhoneValid = function(phone){
    return /^[6-9]\d{9}$/.test(phone)
}

/* const isValidPincode = function(pincode){
    if ( /^\+?([1-9]{1})\)?([0-9]{5})$/.test(pincode)) {return true}
} */

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const validPassword = function (password) {
    if (password.length < 8 || password.length > 15) return false
    return true
}


const isValidString = (String) => {
    return /\d/.test(String)
  }

const isValidSize = (sizes) => {
    return ["S", "XS","M","X", "L","XXL", "XL"].includes(sizes);
  }

const isValidPrice =(price)=>{
   return /^[0-9]+$/.test(price)
}

const isValidInstalments = (installments)=>{
   return /^[0-9]+$/.test(installments)
}

const isValidNum = (num) => {
    return /^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/.test(num);
}

const isValidBoolean = (value) => {
    if(!(typeof value === "boolean")) return false
    return true
}
  

module.exports = {isValid,isEmailValid,isPhoneValid, validPassword, isValidObjectId,isValidSize,isValidBoolean,isValidString,isValidPrice,isValidInstalments,isValidNum}