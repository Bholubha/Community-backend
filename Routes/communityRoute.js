
const express =  require("express")
const router = express.Router();
const {createCommunity, getAllCommunity,getCommunityMembers, getMyOwnedCommunity,getMyJoinedCommunity} = require('../Controller/communityController')


router.route("/").post(createCommunity)
router.route("/").get(getAllCommunity)
router.route("/:id/members").get(getCommunityMembers)
router.route("/me/owner").get(getMyOwnedCommunity)
router.route("/me/member").get(getMyJoinedCommunity)
module.exports = router;