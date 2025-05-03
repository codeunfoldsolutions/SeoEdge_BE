import { Router } from "express";
import ping from "./ping";
import AuthRouter from "../modules/auth/auth.routes";
import SeoRouter from "../modules/seo/seo.routes";

const router = Router();

router.use('/ping', ping);

//Auth routes
router.use('/auth', AuthRouter);
router.use('/seo', SeoRouter);

export default router;
