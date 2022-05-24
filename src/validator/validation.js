const { default: mongoose } = require("mongoose");

const isValid = function (value){
    if (typeof (value) === "undefined" || typeof (value) === null) {return false}
    if (typeof (value) === "string" && value.trim().length > 0) {return true}
    if (typeof (value) === "number" && value.toString().trim().length > 0){return true}
    if (typeof (value) === "object" && value.length > 0){return true}
    if (typeof (value) === null){return false}
}

module.exports = {isValid}