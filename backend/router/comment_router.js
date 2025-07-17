// router for comment-related routes

import { Router } from "express";
import { Comment } from "../model/comment.js";
import { Photo } from "../model/photo.js";

export const commentRouter = Router();

/** * What are the commentRouter routes?
 * * - DELETE /comments/:id: Delete a comment by ID
 **/

// Delete a comment by ID
commentRouter.delete("/:id", async (req, res) => {
  const commentId = req.params.id;

  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the comment belongs to a photo
    const photo = await Photo.findByPk(comment.imageId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    await comment.destroy();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
