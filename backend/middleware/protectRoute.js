import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
//next() tells Express to move on to the next piece of middleware or route handler in the stack.
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "You need to Login first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in Protect Route method ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
