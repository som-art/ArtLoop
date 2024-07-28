import express from "express";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.json({ message: "Hello from signup endpoint!" });
});

router.get("/login", (req, res) => {
  res.json({ message: "Hello from login route!" });
});

router.get("/logout", (req, res) => {
  res.json({ message: "Hello from logout route!" });
});

export default router;
