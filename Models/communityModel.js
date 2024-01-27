

const mongoose = require("mongoose");

const communitySchema = mongoose.Schema({
    id : {
        type : String,
        unique : true
        
    },

    name : {
        type : String,
        required :[ true, "Please add the communityName"],

    },

    slug : {
        type : String,
       
        unique : true,

    },

    owner : {
        type : String,
        
    }
    
},{
    timestamps : true,
});



module.exports = mongoose.model("Community",communitySchema);