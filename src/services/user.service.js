import db from "../db/db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

//ყველა მომხმარებლის წამოღება ბაზიდან
export const getUsers = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users";
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

//რეგისტრაცია
export const registerUser = async (username, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS, 10)
    );

    return new Promise((resolve, reject) => {
      const query =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

      db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.error("Database Error:", err);
          reject(err);
        } else {
          console.log("User registered with ID:", result.insertId);
          resolve(result.insertId);
        }
      });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

//მეილით პოვნა რეგისტრირებული მომხმარებლის ლოგინისთვის
export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      if (err) {
        return reject("Database error");
      }

      if (results.length === 0) {
        return reject("Invalid email");
      }

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return reject("password");
      }

      // Generate access and refresh tokens
      const accessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
      );

      resolve({ accessToken, refreshToken });
    });
  });
};
