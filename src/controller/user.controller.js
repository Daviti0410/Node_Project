import * as userService from "../services/user.service.js";
import jwt from "jsonwebtoken";

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userId = await userService.registerUser(username, email, password);
    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    res.status(500).json({ error: `Error registering user ${error}` });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { accessToken, refreshToken } = await userService.loginUser(
      email,
      password
    );
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(401).json({ error: error });
  }
};

export const refreshToken = (req, res) => {
  const { token } = req.body;

  if (!token)
    return res.status(401).json({ message: "Refresh token required" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const accessToken = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    res.status(200).json({ accessToken });
  });
};
