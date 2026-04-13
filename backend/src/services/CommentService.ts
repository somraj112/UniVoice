import mongoose from "mongoose";
import { CommentModel, IComment } from "../models/Comment";

interface AddCommentDTO {
  complaintId: string;
  userId:      string;
  body:        string;
  isInternal?: boolean;
}

export class CommentService {
  async addComment(dto: AddCommentDTO): Promise<IComment> {
    if (!dto.body.trim()) throw new Error("Comment body cannot be empty");

    return CommentModel.create({
      complaintId: new mongoose.Types.ObjectId(dto.complaintId),
      userId:      new mongoose.Types.ObjectId(dto.userId),
      body:        dto.body.trim(),
      isInternal:  dto.isInternal ?? false,
    });
  }

  async getCommentsByPost(complaintId: string, includeInternal = false): Promise<IComment[]> {
    const query: Record<string, any> = {
      complaintId: new mongoose.Types.ObjectId(complaintId),
    };
    if (!includeInternal) query.isInternal = false;

    return CommentModel.find(query).sort({ createdAt: 1 });
  }

  async getCommentById(commentId: string): Promise<IComment> {
    const comment = await CommentModel.findById(commentId);
    if (!comment) throw new Error(`Comment ${commentId} not found`);
    return comment;
  }

  async editComment(commentId: string, newBody: string, requestingUserId: string): Promise<IComment> {
    const comment = await this.getCommentById(commentId);

    if (comment.userId.toString() !== requestingUserId) {
      throw new Error("Unauthorized: you can only edit your own comments");
    }
    if (!newBody.trim()) throw new Error("Comment body cannot be empty");

    const updated = await CommentModel.findByIdAndUpdate(
      commentId,
      { $set: { body: newBody.trim() } },
      { new: true }
    );
    if (!updated) throw new Error(`Comment ${commentId} not found`);
    return updated;
  }

  async deleteComment(commentId: string, requestingUserId: string, isAdmin: boolean): Promise<void> {
    const comment = await this.getCommentById(commentId);

    if (!isAdmin && comment.userId.toString() !== requestingUserId) {
      throw new Error("Unauthorized: cannot delete another user's comment");
    }

    await CommentModel.findByIdAndDelete(commentId);
  }

  async getCommentCount(complaintId: string): Promise<number> {
    return CommentModel.countDocuments({
      complaintId: new mongoose.Types.ObjectId(complaintId),
    });
  }
}

export const commentService = new CommentService();