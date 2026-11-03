import { getUser, createUser, updateUser, deleteUser, login } from "../controller/userController";
import auth from "../middleware/auth";
import express from "express";
const router = express.Router();

router.get("/", getUser);
router.post("/login", login)
router.post("/create", createUser);
router.put("/update/:id", auth, updateUser);
router.delete("/delete/:id", auth, deleteUser);

export default router;    