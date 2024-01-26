
const asyncHandler = require("express-async-handler");
const User = require('../Models/userModel');
const {Snowflake} = require('@theinternetfolks/snowflake')
const Validator = require('validator');

//console.log(Snowflake.generate())



const registerUser   = asyncHandler(async (req,res)=>{
   const {name ,email, password} = req.body;
   if(!name || !password || !email){
    res.status(400);
    throw new Error("All Fields are mendatory");
}

// Validate mail first
const validEmail = Validator.isEmail(email);
if(!validEmail){
    res.status(400).send({
        "status": false,
        "errors": [
          {
            "param": "email",
            "message": "Enter Valid Email.",
            "code": "INVALID_DATA"
          }
        ]
      });
   exit(0);
}

const availableUser = await User.findOne({email});

if (availableUser){
    res.status(400).send({
        "status": false,
        "errors": [
          {
            "param": "email",
            "message": "User with this email address already exists.",
            "code": "RESOURCE_EXISTS"
          }
        ]
      });
   exit(0);
}

// console.log(req.body);

// let ID = Snowflake.generate();
// console.log(ID)
// ID = "7156611680346055732"

const user = await User.create({
    _id : Snowflake.generate(),
    name,
    email,
  password
});

if(user){
    res.json({
        _id : user._id,
        email : user.email,
    })
}else{
    res.status(400);
    throw new Error("We Can't registered You ! Sorry");
}
     
});
 
module.exports = {registerUser};
