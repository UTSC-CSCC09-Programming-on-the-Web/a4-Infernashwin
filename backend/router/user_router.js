// router for user-related routes
import { Router } from "express";
import { User } from "../model/user.js";
import { Photo } from "../model/photo.js";
import { Comment } from "../model/comment.js";
import { validateInput } from "../utils/validate-input.js";
import bcrypt from "bcrypt";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { authenticateToken } from "../middleware/authenticator.js";

export const userRouter = Router();

/** What are the userRouter routes?
 * * - POST /users/register: Register a new user
 * * - POST /users/login: Log in an existing user
 * * - GET /users/signout: Log out a user (not implemented, but can be added later)
 * * - GET /users/ Get user based on pagination (This is to get their gallery)
 * * - GET /users/:id/photos: Get all photos of a user via pagination
 * * - POST /users/:id/photos: Upload a new photo for a user
 */

// File Upload Setup
const upload = multer({
  dest: "uploads/", // Directory to store uploaded files
});

// User Registration Route
userRouter.post("/register", async (req, res) => {
  const schema = [
    { name: "username", required: true, type: "string", location: "body" },
    { name: "password", required: true, type: "string", location: "body" },
  ];

  // Validate input
  if (!validateInput(req, res, schema)) {
    return;
    //return res.status(400).json({ error: "Invalid input" });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    where: { username: req.body.username },
  });
  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }

  try {
    // Before storing the user, hash the password using Salted Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // Generate a secure random token for the session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      token: sessionToken,
    });
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, username: user.username, token: user.token },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login Route
userRouter.post("/login", async (req, res) => {
  const schema = [
    { name: "username", required: true, type: "string", location: "body" },
    { name: "password", required: true, type: "string", location: "body" },
  ];

  // Validate input
  if (!validateInput(req, res, schema)) {
    console.log("Invalid input in login route");
    console.log(req.body);
    return;
    //return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // Find user by username
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Always generate a new session token on login
    const sessionToken = crypto.randomBytes(32).toString("hex");
    user.token = sessionToken;
    await user.save();

    // Successful login
    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username, token: user.token },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Signout Route
userRouter.get("/signout", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  try {
    // Find user by token
    const user = await User.findOne({ where: { token } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clear the token to sign out
    user.token = null;
    await user.save();

    res.status(200).json({ message: "User signed out successfully" });
  } catch (error) {
    console.error("Error signing out user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current authenticated user info
userRouter.get("/me", authenticateToken, async (req, res) => {
  res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    token: req.user.token,
  });
});

// Get Users Route (with pagination)
userRouter.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 1; // Default to 1 users per page

  try {
    // Fetch users with pagination, only get users who have a gallery
    const { count, rows } = await User.findAndCountAll({
      offset: (page - 1) * limit,
      limit: limit,
      order: [["createdAt", "DESC"]], // Order by creation date
    });

    // Project only the necessary fields
    const users = rows.map((user) => ({
      id: user.id,
      username: user.username,
      token: user.token, // Include token for authenticated requests
    }));

    if (users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    // Create Token if it does not exist
    for (const user of users) {
      if (!user.token) {
        const tokenSalt = await bcrypt.genSalt(10); // Generate a separate salt for the token
        user.token = await bcrypt.hash(user.username, tokenSalt); // Generate a token based on username
        await User.update({ token: user.token }, { where: { id: user.id } });
      }
    }

    // Return the users
    res.status(200).json({
      page: page,
      totalPages: count,
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get photos from the gallery with pagination
userRouter.get("/me/photos", authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 1;
  try {
    const photos = await req.user.getPhotos({
      offset: (page - 1) * limit,
      limit: limit,
    });
    res.status(200).json({
      page: page,
      limit: limit,
      totalPages: await req.user.countPhotos(),
      photos: photos,
    });
  } catch (error) {
    console.error("Error fetching user photos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get User Photos Route
userRouter.get("/:id/photos", async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 1; // Default to 1 photos per page

  // Try to find the user
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch photos for the user with pagination
    const photos = await user.getPhotos({
      offset: (page - 1) * limit,
      limit: limit,
    });

    // Return the photos
    res.status(200).json({
      page: page,
      limit: limit,
      totalPages: await user.countPhotos(),
      photos: photos,
    });
  } catch (error) {
    console.error("Error fetching user photos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Upload User Photo Route
userRouter.post(
  "/me/photos",
  authenticateToken,
  upload.single("photo"),
  async (req, res) => {
    const schema = [
      { name: "title", required: true, type: "string", location: "body" },
      { name: "photo", required: true, type: "file", location: "file" },
    ];
    if (!validateInput(req, res, schema)) return;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const photo = await req.user.createPhoto({
        title: req.body.title,
        imageMetadata: req.file,
        userId: req.user.id,
      });
      res
        .status(201)
        .json({ message: "Photo uploaded successfully", photoId: photo.id });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all comments for a photo (authenticated user)
userRouter.get(
  "/me/photos/:photoId/comments",
  authenticateToken,
  async (req, res) => {
    const photoId = req.params.photoId;
    try {
      const photo = await Photo.findByPk(photoId);
      if (!photo) return res.status(404).json({ error: "Photo not found" });
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const result = await Comment.findAndCountAll({
        where: { imageId: photoId },
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json({
        page: page,
        totalPages: Math.ceil(result.count / limit),
        comments: result.rows,
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Add a comment to a photo (authenticated user)
userRouter.post(
  "/me/photos/:photoId/comments",
  authenticateToken,
  async (req, res) => {
    const schema = [
      { name: "content", required: true, type: "string", location: "body" },
      { name: "author", required: true, type: "string", location: "body" },
    ];
    if (!validateInput(req, res, schema))
      return res.status(400).json({ error: "Invalid input" });
    try {
      const photoId = req.params.photoId;
      const photo = await Photo.findByPk(photoId);
      if (!photo) return res.status(404).json({ error: "Photo not found" });
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
  }
);

// Delete a photo by ID (authenticated user, any gallery)
userRouter.delete(
  "/me/gallery/:galleryId/photos/:id",
  authenticateToken,
  async (req, res) => {
    const photoId = req.params.id;
    const galleryId = req.params.galleryId;
    try {
      if (galleryId === "-1") {
        return res
          .status(403)
          .json({ error: "Forbidden: Unauthorized access" });
      }
      if (req.user.id != galleryId) {
        return res
          .status(403)
          .json({ error: "Forbidden: Unauthorized access" });
      }
      const photo = await Photo.findByPk(photoId);
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      await Comment.destroy({ where: { imageId: photoId } });
      await photo.destroy();
      res.status(200).json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete a comment by ID (authenticated user, any gallery)
userRouter.delete(
  "/me/gallery/:galleryId/comments/:commentId",
  authenticateToken,
  async (req, res) => {
    const commentId = req.params.commentId;
    const galleryId = req.params.galleryId;
    try {
      if (galleryId === "-1") {
        return res
          .status(403)
          .json({ error: "Forbidden: Unauthorized access" });
      }
      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      const photo = await Photo.findByPk(comment.imageId);
      const isOwner =
        photo && photo.userId == galleryId && req.user.id == galleryId;
      const isAuthor = comment.author === req.user.username;
      if (!isOwner && !isAuthor) {
        return res
          .status(403)
          .json({ error: "Forbidden: Unauthorized access" });
      }
      await comment.destroy();
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
