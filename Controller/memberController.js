
const asyncHandler = require("express-async-handler");
const User = require('../Models/userModel');
const Community = require('../Models/communityModel');
const Member = require("../Models/memberModel")
const Role = require("../Models/roleModel")
const { Snowflake } = require('@theinternetfolks/snowflake')
const jwt = require('jsonwebtoken')


const addMember = asyncHandler(async (req, res) => {

    try {
        // retrieve token from header 
        const token = req.headers.authorization.split(' ')[1];

        const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);

        const userEmail = decodedToken.email;


        const owner = await User.findOne({ email: userEmail });

        let { community, user, role } = req.body;

        const C = await Community.findOne({ id: community })

        // check for valid communityId
        if (!C) {
            res.status(400).send({
                "status": false,
                "errors": [
                    {
                        "param": "community",
                        "message": "Community not found.",
                        "code": "RESOURCE_NOT_FOUND"
                    }
                ]
            })
           return
        }

        // proceed only if community is owned by user

        if (C.owner === owner.id) {

            // If member Already exist 
            const M = await Member.find({ user });
            for(i in M){
                const currM = M[i]
                if(currM.community === community){
                    res.status(400).send({
                        "status": false,
                        "errors": [
                          {
                            "message": "User is already added in the community.",
                            "code": "RESOURCE_EXISTS"
                          }
                        ]
                      })
                      return;
                }
            }
           

            // Check For valid Role
            const R = await Role.findOne({ id: role });
            if (!R) {
                res.status(400).send({
                    "status": false,
                    "errors": [
                        {
                            "param": "role",
                            "message": "Role not found.",
                            "code": "RESOURCE_NOT_FOUND"
                        }
                    ]
                })
                return
            }

            //Check For Valid User
            const U = await User.findOne({ id: user });
            if (!U) {
                res.status(400).send({
                    "status": false,
                    "errors": [
                        {
                            "param": "user",
                            "message": "User not found.",
                            "code": "RESOURCE_NOT_FOUND"
                        }
                    ]
                })
                return
            }


            let ID = Snowflake.generate();

            const member = await Member.create({
                id: ID,
                role : role,
                user : user,
                community : community
            });
            
            
            if(member){
                res.status(200).send({
                    "status": true,
                    "content": {
                      "data": {
                        "id": member.id,
                        "community": member.community,
                        "user": member.user,
                        "role": member.role,
                        "created_at": member.createdAt
                      }
                    }
                  })
            }else{
                res.status(500).send({
                    "message" : "Can't able to add member"
                })
            }



        } else {
            res.status(400).send({
                "status": false,
                "errors": [
                    {
                        "message": "You are not authorized to perform this action.",
                        "code": "NOT_ALLOWED_ACCESS"
                    }
                ]
            })
        }


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


})


///// removeMember module

const removeMember = asyncHandler (async (req,res)=>{
    // Id of user to be removed from community
    const memberId = req.params.id

    try {
        // retrieve token from header 
        const token = req.headers.authorization.split(' ')[1];

        const decodedToken = await jwt.verify(token, process.env.JWT_TOKEN_SECRET);

        const userEmail = decodedToken.email;

        const owner = await User.findOne({ email: userEmail });

        const removalMember = await Member.findOne({id:memberId})

        if(!removalMember){
            res.status(400).send({
                "status": false,
                "errors": [
                  {
                    "message": "Member not found.",
                    "code": "RESOURCE_NOT_FOUND"
                  }
                ]
              })
              return
        }

        // Filter members who have connected with community same as removal member.community

        const M = await Member.find({ community : removalMember.community });

        // flag is true only if user is moderator or admin

        let flag = false
        const roleOfModerator = await Role.findOne({name:"Community Moderator"})
        

        for(i in M){
            
            const currM = M[i];
            // If member of community with community moderator is same as user try to remove member 

            if(currM.role === roleOfModerator.id && currM.user === owner.id) flag = true
        }

        const correspondCommunity = await Community.findOne({id:removalMember.community})

        if(owner.id === correspondCommunity.owner) flag = true

        if(flag){
            const result = await Member.deleteOne({id:memberId})
            if(result){
                res.status(200).send({
                    "status": true
                  })
            }
        }else{
            res.status(400).send({
                "status": false,
                "errors": [
                  {
                    "message": "You are not authorized to perform this action.",
                    "code": "NOT_ALLOWED_ACCESS"
                  }
                ]
              })
        }

    }catch(err){
        console.log(err)
        res.status(400).send({
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

module.exports = { addMember ,removeMember }