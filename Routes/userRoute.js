
const express =  require("express")
const router = express.Router();
const {registerUser, loginUser,getMe} = require('../Controller/userController')


router.route("/signup").post(registerUser)
router.route("/signin").post(loginUser)
router.route("/me").get(getMe)

module.exports = router;