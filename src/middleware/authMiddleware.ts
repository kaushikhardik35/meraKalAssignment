import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../controllers/dbService"; // Import your database pool

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers["authorization"];
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    if (token.substring(0, 6) != "Bearer") {
      res.status(400).json({ message: "Invalid Bearer token." });
    }
    token = token.substring(7);
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const { id: userId } = decoded;
    // Check if user exists
    const client = await pool.connect();
    console.log("CLIENT");
    try {
      const result = await client.query(`SELECT * FROM users WHERE id = $1`, [
        userId,
      ]);
      let user = result.rows[0];
      console.log("RESULT");

      // If user doesn't exist, create one
      if (!user) {
        await client.query(`INSERT INTO users (id, username) VALUES ($1, $2)`, [
          userId,
          decoded.username,
        ]);
        console.log("CREATION");
        // Fetch the newly created user
        user = {
          id: userId,
          username: decoded.username,
        };
      }

      // Attach user to request object
      req.user = user;
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(400).json({ message: "Invalid token.", error });
  }
};
