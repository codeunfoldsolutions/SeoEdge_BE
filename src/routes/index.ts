import { Router } from "express";
import ping from "./ping";

const router = Router();

router.use("/ping", ping);

export default router;
