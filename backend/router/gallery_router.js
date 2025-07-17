import { Router } from "express";
import { Photo } from "../model/photo.js";
import { Comment } from "../model/comment.js";
import { User } from "../model/user.js";
import { authenticateToken } from "../middleware/authenticator.js";
import { Op } from "sequelize";
export const galleryRouter = Router();

/** * What are the galleryRouter routes?
 * * - GET /gallery: Get all photos with pagination, sorted by date
 */

// Get all photos from the given id with pagination, sorted by date
galleryRouter.get("/:id/photos", async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 photos per page
  const offset = (page - 1) * limit;

  try {
    // Fetch photos for the user with pagination
    const { count, rows: photos } = await Photo.findAndCountAll({
      where: { userId: userId },
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]], // Order by creation date, newest first
    });

    res.status(200).json({
      page: page,
      totalPages: Math.ceil(count / limit),
      photos: photos,
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a user who's gallery we will display (pagination, sorted by date)
galleryRouter.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 users per page
  const offset = (page - 1) * limit;

  try {
    // Fetch users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]], // Order by creation date, newest first
    });

    res.status(200).json({
      page: page,
      totalPages: Math.ceil(count / limit),
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
