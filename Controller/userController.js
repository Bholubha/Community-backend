
const asyncHandler = require("express-async-handler");
const User = require('../Models/userModel');
const { Snowflake } = require('@theinternetfolks/snowflake')
const Validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const express = require('express');
const app = express();
app.use(cookieParser())

/////////Signup User

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !password || !email) {
    res.status(400).send("All Fields are mendatory");
  }

  // Validate mail first
  const validEmail = Validator.isEmail(email);
  if (!validEmail) {
    res.status(400).json({
      "status": false,
      "errors": [
        {
          "param": "email",
          "message": "Please provide a valid email address.",
          "code": "INVALID_INPUT"
        }
      ]
    });
   return ;
  }

  // Check email exist or not
  const availableUser = await User.findOne({ email });

  if (availableUser) {
    res.status(400).json({
      "status": false,
      "errors": [
        {
          "param": "email",
          "message": "User with this email address already exists.",
          "code": "RESOURCE_EXISTS"
        }
      ]
    });
    return;
  }



  // Validate Password Strength with min length of 6
  const isValidPassword = Validator.isLength(password, { min: 6 });

  if (!isValidPassword) {
    res.status(400).json({
      "status": false,
      "errors": [
        {
          "param": "password",
          "message": "Password should be at least 6 characters.",
          "code": "INVALID_INPUT"
        }
      ]
    });
    return;
  }


  // check for valid name
  const isValidName = Validator.isLength(name, { min: 2 });

  if (!isValidName) {
    res.status(400).json({
      "status": false,
      "errors": [
        {
          "param": "name",
          "message": "Name  should be at least 2 characters.",
          "code": "INVALID_INPUT"
        }
      ]
    });
    return
  }



  let ID = Snowflake.generate();
 

  const hash = await bcrypt.hash(password, saltRounds);


  const user = await User.create({
    id: ID,
    name,
    email,
    password: hash
  });


  const token = jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: '24h'
    }
  );

  


  if (user) {
    res.status(200).json({

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
  } else {
    res.status(500).json({"message" : "We Can't able registered You ! Sorry"});
  }

});


///////// Signin user

const loginUser = asyncHandler(async (req, res) => {

  const { email, password } = req.body;
  if (!password || !email) {
    res.status(400).send("All Fields are mendatory");
  }

  // Validate mail first
  const validEmail = Validator.isEmail(email);
  if (!validEmail) {
    res.status(400).json({
      "status": false,
      "errors": [
        {
          "param": "email",
          "message": "Please provide a valid email address.",
          "code": "INVALID_INPUT"
        }
      ]
    });
    return;
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      { id: user._id, email },
      process.env.JWT_TOKEN_SECRET,
      { expiresIn: '30h' }
    )

    // use of cookies

    const options = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true
    };

    // sending token in cookie also 

    res.status(201).cookie("token", token, options).json({

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

    res.status(400).json({
      "status": false,
      "errors": [
        {
          "param": "password",
          "message": "The credentials you provided are invalid.",
          "code": "INVALID_CREDENTIALS"
        }
      ]
    })

  }

});


const getMe = asyncHandler(async (req, res) => {

  try{
  // retrieve token from header 
  const token = req.headers.authorization.split(' ')[1];
  


    const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  
    
    const userEmail = decodedToken.email;
    

    const user = await User.findOne({ email: userEmail });
    

  if(user){

    res.json({
      "status": true,
      "content": {
        "data": {
          "id": user.id,
          "name": user.name,
          "email": user.email,
          
          "created_at": user.created_at
        }
      }
    });

    }else{
 
    res.status(401).json({
      "status": false,
      "errors": [
        {
          "message": "You need to sign in to proceed.",
          "code": "NOT_SIGNEDIN"
        }
      ]
    });
  }
}catch(error){
 
  res.status(401).json({
    "status": false,
    "errors": [
      {
        "message": "You need to sign in to proceed.",
        "code": "NOT_SIGNEDIN"
      }
    ]
  });
}

})



module.exports = { registerUser, loginUser, getMe };
