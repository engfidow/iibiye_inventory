const express = require("express");
const { getUsers, getUser, createUser, updateUser, deleteUser } = require("../controllers/user");
const router = express.Router();

// router.get("/",getUsers);
// router.get("/:id",getUser),
router.post("/api/users",createUser),
router.post("/api/auth/login",auth),

router.patch("/:id",updateUser),
router.delete("/:id",deleteUser)
module.exports=router;