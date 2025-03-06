import { Router, Request, Response } from "express";

const router = Router();

// Health check route
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Pong" });
});

export default router;
