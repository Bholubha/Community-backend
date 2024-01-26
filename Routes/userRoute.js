
const express =  require("express")
const router = express.Router();
const {registerUser} = require('../Controller/userController')


router.route("/signup").post(registerUser)



module.exports = router;