// Token Authenticator Middleware
import { User } from "../model/user.js";

export async function authenticateToken(req, res, next) {
  let token = req.headers.authorization;
  if (!token) {
    console.log("[authenticator] No token found in header:", token);
    return res.status(401).json({ error: "Unauthorized: Token required" });
  }
  // No longer require 'Bearer ' prefix
  // token = token.slice(7); // Remove 'Bearer '
  console.log("[authenticator] Received token:", token);
  const user = await User.findOne({ where: { token } });
  if (!user) {
    console.log("[authenticator] No user found for token:", token);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
  console.log("[authenticator] Authenticated user:", user.username, user.id);
  req.user = user;
  next();
}
