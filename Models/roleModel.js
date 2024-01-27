

const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
    id : {
        type : String,
        unique : true
        
    },

    name : {
        type : String,
        required :[ true, "Please add the communityName"],

    },
    
},{
    timestamps : true,
});



module.exports = mongoose.model("role",roleSchema);