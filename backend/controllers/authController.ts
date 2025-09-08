import { Request, Response } from "express";
import { User } from "../models/User";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    // The core logic will be added in subsequent commits.
    res.status(201).json({ message: "User registration endpoint created." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};