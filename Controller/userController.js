
const asyncHandler = require("express-async-handler");
const User = require('../Models/userModel');
const {Snowflake} = require('@theinternetfolks/snowflake')
const Validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const express = require('express');
const app = express();
app.use(cookieParser())


const registerUser   = asyncHandler(async (req,res)=>{
   const {name ,email, password} = req.body;
   if(!name || !password || !email){
    res.status(400).send("All Fields are mendatory");
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
            "code": "INVALID_INPUT"
          }
        ]
      });
   exit(0);
}

// Check email exist or not
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



// Validate Password Strength with min length of 6
const isValidPassword = Validator.isLength(password,{ min: 6 });

if(!isValidPassword){
    res.status(400).send({
        "status": false,
        "errors": [
          {
            "param": "password",
            "message": "Password should be at least 6 characters.",
            "code": "INVALID_INPUT"
          }
        ]
      });
   exit(0);
}


// check for valid name
 const isValidName = Validator.isLength(name,{ min: 2});

 if(!isValidName){
    res.status(400).send({
        "status": false,
        "errors": [
          {
            "param": "password",
            "message": "Name  should be at least 2 characters.",
            "code": "INVALID_INPUT"
          }
        ]
      });
   exit(0);
}



let ID = Snowflake.generate();
console.log(ID)

const hash = await bcrypt.hash(password, saltRounds);
console.log(hash)

const user = await User.create({
    id : ID,
    name,
    email,
  password : hash
});


const token = jwt.sign(
  {id : user.id,
  email : user.email},
  process.env.JWT_TOKEN_SECRET,
  {
    expiresIn : '24h'
  }
);

console.log(token)


if(user){
    res.json({
        
            "status": true,
            "content": {
              "data": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at
              },
              "meta": {
                token
              }
            }
          
    })
}else{
    res.status(400).send("We Can't registered You ! Sorry");
}
     
});
 

const loginUser = asyncHandler(async (req,res)=>{

  const {email, password} = req.body;
  if(!password || !email){
   res.status(400).send("All Fields are mendatory");
  }

  const user = await User.findOne({email});

  if(user && (await bcrypt.compare(password,user.password))){
    const token = jwt.sign(
      {id : user._id,email},
      process.env.JWT_TOKEN_SECRET,
      {expiresIn : '30h'}
    )

    // use of cookies

    const options = {
        expires : new Date(Date.now() + 24*60*60*1000),
        httpOnly : true
    };

    // sending token in cookie also 

    res.status(201).cookie("token",token,options).json({
        
      "status": true,
      "content": {
        "data": {
          "id": user.id,
          "name": user.name,
          "email": user.email,
          "created_at": user.created_at
        },
        "meta": {
          token
        }
      }
    
})}

});


const Getme = asyncHandler(async (req,res)=>{
const token = req.headers.authorization.split(' ')[2];
console.log(token)
try {
  const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  console.log(decodedToken)
  const userEmail = decodedToken.email;
  console.log(userEmail)
  const user = await User.findOne({email:userEmail});
  console.log(user)
  res.status(200).json(user);

} catch (error) {
  res.status(401).json({ error: 'Invalid token' });
}
})



module.exports = {registerUser,loginUser,Getme};
