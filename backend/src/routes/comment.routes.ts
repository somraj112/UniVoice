import { Router, Request, Response } from "express";
import { commentService } from "../services/CommentService";


const router = Router();

router.get("/:postId", async (req: Request, res: Response) => {
  try {
    const isAdmin = (req as any).user?.role === "admin";
    const comments = await commentService.getCommentsByPost(req.params.postId, isAdmin);
    res.json({ success: true, data: comments.map((c) => c.toJSON()) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.post(
  "/",

  async (req: Request, res: Response) => {
    try {
      const { complaintId, body, isInternal } = req.body;
      const userId = (req as any).user?.userId ?? req.body.userId;

      if (!complaintId || !body) {
        return res.status(400).json({ success: false, message: "complaintId and body are required" });
      }

      const comment = await commentService.addComment({ complaintId, userId, body, isInternal });
      res.status(201).json({ success: true, data: comment.toJSON() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);


router.patch("/:commentId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId ?? req.body.userId;
    const updated = await commentService.editComment(req.params.commentId, req.body.body, userId);
    res.json({ success: true, data: updated.toJSON() });
  } catch (err: any) {
    const status = err.message.includes("Unauthorized") ? 403 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});


router.delete("/:commentId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId ?? req.body.userId;
    const isAdmin = (req as any).user?.role === "admin";
    await commentService.deleteComment(req.params.commentId, userId, isAdmin);
    res.json({ success: true, message: "Comment deleted" });
  } catch (err: any) {
    const status = err.message.includes("Unauthorized") ? 403 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

export default router;