import { PostStatus } from "../models/Post";
import { postService } from "./PostService";
import { authService } from "./AuthService";
import { PostModel } from "../models/Post";
import { UserModel } from "../models/User";

export interface AdminStats {
  totalPosts: number;
  byStatus: Record<string, number>;
  totalUsers: number;
  resolvedThisWeek: number;
}

export class AdminService {

  // ASSIGN POST 

  async assignPost(postId: string, staffId: string, adminId: string) {
    const admin = await authService.getUserById(adminId);
    if (admin.role !== "admin") {
      throw new Error("Only admins can assign posts");
    }
    // Verify assignee exists
    await authService.getUserById(staffId);
    return postService.assignPost(postId, staffId);
  }

  // CHANGE STATUS 

  async changePostStatus(postId: string, newStatus: PostStatus, adminId: string) {
    const admin = await authService.getUserById(adminId);
    if (admin.role !== "admin" && admin.role !== "faculty") {
      throw new Error("Only admins or faculty can change post status");
    }
    return postService.changeStatus(postId, newStatus);
  }

  // DELETE POST 

  async deletePost(postId: string, adminId: string): Promise<void> {
    const admin = await authService.getUserById(adminId);
    if (admin.role !== "admin") {
      throw new Error("Only admins can delete posts");
    }
    await postService.deletePost(postId, adminId, true);
  }

  // LIST ALL POSTS 

  async listAllPosts(filters?: { status?: PostStatus; category?: string }) {
    const query: Record<string, any> = {};
    if (filters?.status)   query.status   = filters.status;
    if (filters?.category) query.category = filters.category;
    return PostModel.find(query).sort({ createdAt: -1 }).lean();
  }

  // STATS 

  async getStats(): Promise<AdminStats> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Run all DB queries in parallel for speed
    const [totalPosts, totalUsers, statusGroups, resolvedThisWeek] = await Promise.all([
      PostModel.countDocuments(),
      UserModel.countDocuments(),
      PostModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      PostModel.countDocuments({
        status: PostStatus.RESOLVED,
        updatedAt: { $gte: oneWeekAgo },
      }),
    ]);

    const byStatus = statusGroups.reduce((acc: Record<string, number>, g: any) => {
      acc[g._id] = g.count;
      return acc;
    }, {});

    return { totalPosts, byStatus, totalUsers, resolvedThisWeek };
  }
}

export const adminService = new AdminService();
