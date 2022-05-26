const { default: mongoose } = require("mongoose"); 
//@ts-check
const isValid = function (value){
    if (typeof (value) === "undefined" || typeof (value) === null) {return false}
    if (typeof (value) === "string" && value.trim().length > 0) {return true}
    if (typeof (value) === "number" && value.toString().trim().length > 0){return true}
    if (typeof (value) === null){return false}
}

// The test() method executes a search for a match between a regular expression and a specified string. Returns true or false.

const isEmailValid = function (email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

const isPhoneValid = function(phone){
    return /^[6-9]\d{9}$/.test(phone)
}

const isValidPincode = function(pincode){
    if ( /^\+?([1-9]{1})\)?([0-9]{5})$/.test(pincode)) {return true}
}

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}



const isValidString = (String) => {
    return /\d/.test(String)
  }

const isValidSize = (sizes) => {
    return ["S", "XS","M","X", "L","XXL", "XL"].includes(sizes);
  }
  


module.exports = {isValid,isEmailValid,isPhoneValid,isValidPincode, isValidObjectId,isValidSize,isValidString}