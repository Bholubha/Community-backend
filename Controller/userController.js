const asyncHandler = require("express-async-handler");
const User = require('../Models/userModel');
const {Snowflake} = require('@theinternetfolks/snowflake')
//console.log(Snowflake.generate())



const registerUser   = asyncHandler(async (req,res)=>{
   const {name ,email, password} = req.body;
   if(!name || !password || !email){
    res.status(400);
    throw new Error("All Fields are mendatory");
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

console.log(req.body);

const user = await User.create({
    _id : Snowflake.generate().toString(),
    name,
    email,
  password
});

if(user){
    res.json({
        _id : user.id,
        email : user.email,
    })
}else{
    res.status(400);
    throw new Error("We Can't registered You ! Sorry");
}
     
});
 
module.exports = {registerUser};
