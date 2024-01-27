

const mongoose = require("mongoose");

const memberSchema = mongoose.Schema({
    id : {
        type : String,
        unique : true
        
    },

    community : {
        type : String,
        required :[ true, "Please add the communityId"],

    },

    user : {
        type : String,
        required :[ true, "Please Enter Your userid"],

    },

    role : {
        type : String,
        required : [true,"Please enter the roleId"],
    }
    
},{
    timestamps : true,
});



module.exports = mongoose.model("Member",memberSchema);