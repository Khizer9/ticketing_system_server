const express = require("express");
const { RegisterAnyone, RegisterForClient, Login, currentUser } = require("../controllers/user_cntrl");

const router = express.Router();


router.post('/register/a/user', RegisterAnyone)
router.post('/register', RegisterForClient)
router.post('/login', Login)
router.post('/current-user', currentUser)


module.exports = router;
