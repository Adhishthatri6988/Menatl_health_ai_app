import { Request, Response } from "express";
import { User } from "../models/User";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }
    const user = new User({ name, email, password }); // Plaintext password
    await user.save();
    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email },
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};