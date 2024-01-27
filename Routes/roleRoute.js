const express =  require("express")
const router = express.Router();
const {addRole,getAllRole} = require('../Controller/roleController')


router.route("/").post(addRole)
router.route("/").get(getAllRole)

module.exports = router;