

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id : {
        type : String,
        
    },

    name : {
        type : String,
        required :[ true, "Please add the Username"],

    },

    email : {
        type : String,
        required :[ true, "Please Enter Your mail"],

    },

    password : {
        type : String,
        required : [true,"Please enter the password"],
    }
    
},{
    timestamps : true,
});

// userSchema.set('primary', 'id');

module.exports = mongoose.model("User",userSchema);