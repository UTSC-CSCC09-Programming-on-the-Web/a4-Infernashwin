// router for photo-related routes
import { Router } from "express";
import { Photo } from "../model/photo.js";
import { Comment } from "../model/comment.js";
import path from "path";
import multer from "multer";
import { validateInput } from "../utils/validate-input.js";

export const photoRouter = Router();

/** * What are the photoRouter routes?
 * * - GET /photos/:id/comments: Get all comments for a photo, 10 per page
 * * - POST /photos/:id/comments: Add a comment to a photo
 * * - DELETE /photos/:id: Delete a photo by ID
 * * - GET /photos/:id/image: Get the image file of a photo
 **/

// File retrieval setup
const upload = multer({
  dest: "uploads/", // Directory to store uploaded files
});

// Get all comments for a photo
photoRouter.get("/:id/comments", async (req, res) => {
  const photoId = req.params.id;

  try {
    // Ensure the photo exists
    const photo = await Photo.findByPk(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    // Fetch comments for the photo with pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 comments per page
    const offset = (page - 1) * limit;

    // Fetch and count comments with photoId == photoId
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { imageId: photoId },
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]], // Order by creation date, newest first
    });

    res.status(200).json({
      page: page,
      totalPages: Math.ceil(count / limit),
      comments: comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a comment to a photo
photoRouter.post("/:id/comments", async (req, res) => {
  const schema = [
    { name: "content", required: true, type: "string", location: "body" },
    { name: "author", required: true, type: "string", location: "body" },
  ];

  if (!validateInput(req, res, schema)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const photoId = req.params.id;
    const photo = await Photo.findByPk(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const comment = await photo.createComment({
      author: req.body.author,
      imageId: photoId,
      content: req.body.content,
    });
    res
      .status(201)
      .json({ message: "Comment added successfully", commentId: comment.id });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a photo by ID
photoRouter.delete("/:id", async (req, res) => {
  const photoId = req.params.id;

  try {
    const photo = await Photo.findByPk(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Now we need to delete the photo, all the associated comments, and the image file
    // First, delete all comments associated with the photo
    const comments = await Comment.findByPk(photoId);
    if (comments) {
      await comments.destroy();
    }

    // I don't know how to delete the file from uploads, or if we actually need to so ignore for now
    // If i forget to delete this comment mb

    // Delete the photo record
    await photo.destroy();

    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get the image file of a photo
photoRouter.get("/:id/image", async (req, res) => {
  const photoId = parseInt(req.params.id);
  try {
    const photo = await Photo.findByPk(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    if (!photo.imageMetadata) {
      return res.status(404).json({ error: "Image metadata not found" });
    }
    // Send the file from the uploads directory
    res.sendFile(photo.imageMetadata.path, { root: path.resolve() });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
