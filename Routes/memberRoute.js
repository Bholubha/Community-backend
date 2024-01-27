const express =  require("express")
const router = express.Router();
const {addMember,removeMember} = require('../Controller/memberController')


router.route("/").post(addMember)
router.route("/:id").delete(removeMember)
module.exports = router;