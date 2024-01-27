
const asyncHandler = require("express-async-handler");
const Community = require('../Models/communityModel');
const User = require('../Models/userModel');
const Member = require("../Models/memberModel")
const Role = require("../Models/roleModel")
const { Snowflake } = require('@theinternetfolks/snowflake')
const Validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const express = require('express');
const app = express();
app.use(cookieParser())

const createCommunity = asyncHandler(async (req, res) => {

    // First Validata User
    const token = req.headers.authorization.split(' ')[1];


    try {

        const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);

        const userEmail = decodedToken.email;

        const user = await User.findOne({ email: userEmail });
        //console.log(user)

        const { name } = req.body;

        // check name already present as community name or not

        const isNamePresent = await Community.findOne({ name })
        if (isNamePresent) {
            res.status(400).send({
                "status": false,
                "errors": [
                    {
                        "param": "name",
                        "message": "Community With This Name Already Exist",
                        "code": "INVALID_INPUT"
                    }
                ]
            });
            return
        }

        // Check Length of name
        const isValidName = Validator.isLength(name, { min: 2 });

        if (!isValidName) {

            res.status(400).send({
                "status": false,
                "errors": [
                    {
                        "param": "name",
                        "message": "Name should be at least 2 characters.",
                        "code": "INVALID_INPUT"
                    }
                ]
            })
            return;
        }

        let ID = Snowflake.generate();

        const community = await Community.create({
            id: ID,
            name,
            slug: name,
            owner: user.id,
        });

        const roleIdofAdmin = await Role.findOne({ name: "Community Admin" })
        console.log(roleIdofAdmin)

        ID = Snowflake.generate();
        const M = await Member.create({
            id: ID,
            community: community.id,
            user: user.id,
            role: roleIdofAdmin.id
        })

        if (community) {
            res.status(200).send({
                "status": true,
                "content": {
                    "data": {
                        "id": community.id,
                        "name": community.name,
                        "slug": community.slug,
                        "owner": community.owner,
                        "created_at": community.created_at,
                        "updated_at": community.updated_at
                    }
                }
            })
        } else {
            res.status(500).send({
                "message": "Can't able to create community"
            })
        }


    } catch (error) {
        console.log(error)
        res.status(401).send({
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


///// GetAllCommunity

const getAllCommunity = asyncHandler(async (req, res) => {

    const communities = await Community.find({});

    const list = []

    for (i in communities) {
        comm = communities[i]
        //console.log(comm)
        userName = await User.findOne({ id: comm.owner });
        list.push({
            id: comm.id,
            name: comm.name,
            slug: comm.slug,
            owner: {
                id: comm.owner,
                name: userName.name
            },
            created_at: comm.createdAt,
            updated_at: comm.updatedAt
        })
    }

    const finalList = {
        "status": true,
        "content": {
            "meta": {
                "total": list.length,
                "pages": Math.ceil(list.length / 10),
                "page": 1
            }
        }
    }

    finalList.content.data = list

    res.send(finalList);

});


/// Get Member Of Community 

const getCommunityMembers = asyncHandler(async (req, res) => {

    // As in path id = name of community
    const communityName = req.params.id;
    const community = await Community.findOne({name:communityName}) 
    if(!community){
        res.status(400).send({
            "message" : "please enter valid community-name in path"
        })
        return
    }
    const members = await Member.find({});
    
    const list = []

    for (i in members) {
        currM = members[i]
        if (currM.community === community.id) {
            const currU = await User.findOne({ id: currM.user })
            const currR = await Role.findOne({ id: currM.role })
            list.push({
                id: currM.id,
                community: community.id,
                user: {
                    id: currU.id,
                    name: currU.name
                },
                role: {
                    id: currR.id,
                    name: currR.name
                }
            })
        }

    }

    const finalList = {
        "status": true,
        "content": {
            "meta": {
                "total": list.length,
                "pages": Math.ceil(list.length/10),
                "page": 1
            }
        }
    }

    finalList.content.data = list;
    res.status(200).send(finalList);

});


//// Get My Owned Community 

const getMyOwnedCommunity = asyncHandler(async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    try {

        const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);

        const userEmail = decodedToken.email;

        const user = await User.findOne({ email: userEmail });

        if (!user) res.status(500).send("Need to sign IN")


        const communities = await Community.find({});

        const list = []

        for (i in communities) {
            comm = communities[i]

            if (comm.owner === user.id) {
                list.push({
                    id: comm.id,
                    name: comm.name,
                    slug: comm.slug,
                    owner: user.id,
                    created_at: comm.createdAt,
                    updated_at: comm.updatedAt
                })
            }
        }

        const FinalList = {

            "status": true,
            "content": {
                "meta": {
                    "total": list.length,
                    "pages": Math.ceil(list.length / 10),
                    "page": 1
                }
            }
        }

        FinalList.content.data = list;


        res.status(200).send(FinalList);


    } catch (err) {
        res.status(400).json({
            "status": false,
            "errors": [
                {
                    "message": "You are not authorized to perform this action.",
                    "code": "NOT_ALLOWED_ACCESS"
                }
            ]
        })
    }

});

//// getMyJoinedCommunity Module

const getMyJoinedCommunity = asyncHandler (async(req,res)=>{

    const token = req.headers.authorization.split(' ')[1];

    try {

        const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);

        const userEmail = decodedToken.email;

        const user = await User.findOne({ email: userEmail });

        if (!user) res.status(500).send("Need to sign IN")

        //  Get All memberList 
        const members = await Member.find({});

    const list = []

    for (i in members) {
        currM = members[i]
        if (currM.user === user.id) {
            const currC = await Community.findOne({ id: currM.community })
            const owner = await User.findOne({id : currC.owner})
            list.push({
                id: currC.id,
                name : currC.name,
                slug : currC.slug,
                owner: {
                    id: owner.id,
                    name: owner.name
                },
                created_at: currM.createdAt,
                updated_at: currM.updatedAt
                
            })
        }

    }

    const finalList = {
        "status": true,
        "content": {
          "meta": {
            "total": list.length,
            "pages": Math.ceil(list.length/10),
            "page": 1
          }
        }
    }

    finalList.content.data =    list;

    res.status(200).send(finalList);


    }catch(err){
        console.log(err)
        res.status(400).json({
            "status": false,
            "errors": [
                {
                    "message": "You are not authorized to perform this action.",
                    "code": "NOT_ALLOWED_ACCESS"
                }
            ]
        })
    }

})


module.exports = { createCommunity, getAllCommunity, getCommunityMembers, getMyOwnedCommunity ,getMyJoinedCommunity};



