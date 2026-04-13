import { Router, Request, Response } from "express";
import { announcementService } from "../services/AnnouncementService";

const router = Router();


router.get("/", async (_req: Request, res: Response) => {
  try {
    const list = await announcementService.getAll();
    res.json({ success: true, data: list.map((a) => a.toJSON()) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.post(
  "/",

  async (req: Request, res: Response) => {
    try {
      const { title, body, isPinned } = req.body;
      const userId = (req as any).user?.userId ?? req.body.userId;

      if (!title || !body) {
        return res.status(400).json({ success: false, message: "title and body are required" });
      }

      const ann = await announcementService.create({ userId, title, body, isPinned });
      res.status(201).json({ success: true, data: ann.toJSON() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);


router.patch("/:id/pin", async (req: Request, res: Response) => {
  try {
    const updated = await announcementService.togglePin(req.params.id);
    res.json({ success: true, data: updated.toJSON() });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});


router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await announcementService.delete(req.params.id);
    res.json({ success: true, message: "Announcement deleted" });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

export default router;