import { Router, Request, Response } from "express";
import { postService } from "../services/PostService";
import { PostStatus, PostPriority } from "../models/Post";

// authMiddleware will be written by Somraj — imported here
// import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = Router();

// GET /api/posts 
// Returns all posts. Supports ?category=&status= query filters.
router.get("/", (req: Request, res: Response) => {
  try {
    let posts = postService.getAllPosts();

    if (req.query.category) {
      posts = posts.filter(
        (p) => p.category === (req.query.category as string)
      );
    }
    if (req.query.status) {
      posts = posts.filter((p) => p.status === (req.query.status as PostStatus));
    }

    res.json({ success: true, data: posts.map((p) => p.toJSON()) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/posts/:id 
router.get("/:id", (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const post = postService.getPostById(id);
    const vs = postService.getValidityScore(id);
    res.json({ success: true, data: { ...post.toJSON(), validityScoreData: vs?.toJSON() } });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// POST /api/posts 
// Protected: requires login (verifyToken middleware from Somraj)
router.post(
  "/",
  // verifyToken,   // uncomment once Somraj adds authMiddleware
  (req: Request, res: Response) => {
    try {
      const { title, body, category, priority, tags, isAnonymous } = req.body;

      if (!title || !category) {
        return res.status(400).json({
          success: false,
          message: "title and category are required",
        });
      }

      // req.user injected by verifyToken middleware
      // For now fallback to body.userId until middleware is ready
      const userId = (req as any).user?.userId ?? req.body.userId;

      const post = postService.createPost({
        userId,
        title,
        body,
        category,
        priority: priority as PostPriority,
        tags: Array.isArray(tags) ? tags : [],
        isAnonymous: isAnonymous ?? false,
      });

      res.status(201).json({ success: true, data: post.toJSON() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);
// PATCH /api/posts/:id 
router.patch("/:id", (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId ?? req.body.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = postService.updatePost(id, req.body, userId);
    res.json({ success: true, data: updated.toJSON() });
  } catch (err: any) {
    const status = err.message.includes("Unauthorized") ? 403 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});
// PATCH /api/posts/:id/status
router.patch("/:id/status", (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!Object.values(PostStatus).includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = postService.changeStatus(id, status as PostStatus);
    res.json({ success: true, data: updated.toJSON() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// POST /api/posts/:id/upvote 
router.post("/:id/upvote", (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId ?? req.body.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = postService.upvote(id, userId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    const status = err.message.includes("already voted") ? 409 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});
// POST /api/posts/:id/downvote 
router.post("/:id/downvote", (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId ?? req.body.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = postService.downvote(id, userId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    const status = err.message.includes("already voted") ? 409 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});
// DELETE /api/posts/:id 
router.delete("/:id", (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId ?? req.body.userId;
    const isAdmin = (req as any).user?.role === "admin";
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    postService.deletePost(id, userId, isAdmin);
    res.json({ success: true, message: "Post deleted" });
  } catch (err: any) {
    const status = err.message.includes("Unauthorized") ? 403 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

export default router;