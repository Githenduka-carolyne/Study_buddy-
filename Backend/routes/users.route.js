import { Router } from "express";
import { createUser, loginUser } from "./controllers/users.controller.js";
import { validateInfo } from "../middleware/middleware.js";
const router = Router();

router.post("/signup", validateInfo, createUser);
router.post("/login", loginUser);

export default router;
