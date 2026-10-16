const express = require("express");
const router = express.Router();

const { getUser, createUser, updateUser, deleteUser, login } = require("../controller/userController");
const auth = require("../middleware/auth");

router.get("/", getUser);
router.post("/login", login)
router.post("/create", auth, createUser);
router.put("/update/:id", auth, updateUser);
router.delete("/delete/:id", auth, deleteUser);

module.exports = router;