
const express =  require("express")
const router = express.Router();
const {registerUser, loginUser,Getme} = require('../Controller/userController')


router.route("/signup").post(registerUser)
router.route("/signin").post(loginUser)
router.route("/me").get(Getme)

module.exports = router;