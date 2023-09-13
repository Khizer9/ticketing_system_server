const express = require("express");

const { loginReq, AdminAndManager } = require("../middlewares/auths");
const { getAllCategories, createCategory, EditCategory, deleteCategory } = require("../controllers/category_cntrl");

const router = express.Router();

// /by/auth/
router.get('/all/categories', getAllCategories);

// for auths
router.post('/by/auth/create/category', loginReq, AdminAndManager, createCategory);
router.put('/by/auth/edit/category', loginReq, AdminAndManager, EditCategory);
router.delete('/by/auth/delete/:_id',loginReq, AdminAndManager ,deleteCategory)



// getAgentsByMostTicketsSolved
// getUsersWhoBreachedSecondSLA
module.exports = router;
