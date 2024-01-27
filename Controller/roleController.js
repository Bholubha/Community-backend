const asyncHandler = require("express-async-handler");
const { Snowflake } = require('@theinternetfolks/snowflake')
const Validator = require('validator');
const Role = require("../Models/roleModel")

///// addRole Module 

const addRole = asyncHandler(async (req, res) => {
    const { name } = req.body

    // If role already exist
    const isRolePresent = await Role.findOne({ name })

    if (isRolePresent) {
        res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "name",
                    "message": "This role is already exist",
                    "code": "INVALID_INPUT"
                }
            ]
        })
        exit(0);
    }

    // check for validation of role name
    const isValidName = Validator.isLength(name, { min: 2 });

    if (!isValidName) {
        res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "name",
                    "message": "Name should be at least 2 characters.",
                    "code": "INVALID_INPUT"
                }
            ]
        })
        exit(0);
    }

    let ID = Snowflake.generate();

    const role = await Role.create({
        id: ID,
        name,
    });

    if (role) {
        res.status(200).json(
            {
                "status": true,
                "content": {
                    "data": {
                        "id": role.id,
                        "name": role.name,
                        "created_at": role.createdAt,
                        "updated_at": role.updatedAt
                    }
                }
            }
        )
    } else {
        res.status(500).json({
            "message": "Can't able to add role"
        })
    }

});


//// getAllRole Module 

const getAllRole = asyncHandler(async (req, res) => {
    const roles = await Role.find({});

    const list = []

    for (i in roles) {
        const currRole = roles[i]
        list.push({
            id: currRole.id,
            name: currRole.name,
            created_at: currRole.createdAt,
            updated_at: currRole.updatedAt
        })
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

    finalList.content.data = list

    res.status(200).json(finalList)
    
});





module.exports = { addRole, getAllRole }
