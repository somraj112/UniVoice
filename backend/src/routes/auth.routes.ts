import { Router, Request, Response } from "express";
import { authService } from "../services/AuthService";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// POST /api/auth/register 
router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      name, email, password, role, gender,
      department, yearOfStudy,
      rollNumber, course,        // student fields
      employeeId, designation,   // faculty fields
      adminLevel,                // admin fields
    } = req.body;

    if (!name || !email || !password || !role || !gender || !department) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, role, gender, department are required",
      });
    }

    const { user, token } = await authService.register({
      name, email, password, role, gender,
      department, yearOfStudy: Number(yearOfStudy),
      rollNumber, course,
      employeeId, designation,
      adminLevel,
    });

    res.status(201).json({
      success: true,
      data: { user: user.toSafeJSON(), token },
    });
  } catch (err: any) {
    const status = err.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login 
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const { user, token } = await authService.login(email, password);

    res.json({
      success: true,
      data: { user: user.toSafeJSON(), token },
    });
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me 
// Returns current logged-in user's profile
router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.json({ success: true, data: user.toSafeJSON() });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

export default router;