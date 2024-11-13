import express from "express";
import {
  getAllUsers,
  register,
  login,
  refreshToken,
} from "../controller/user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

export default router;
