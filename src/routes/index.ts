import { Router } from "express";
import ping from "./ping";
import AuthRouter from "../modules/auth/auth.routes";

const router = Router();

router.use("/ping", ping);

//Auth routes
router.use("/auth", AuthRouter);

export default router;
