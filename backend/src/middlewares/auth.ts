import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).send("Unauthorized: No token provided");

    try {
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        if (!accessTokenSecret) {
            return res.status(500).send("Server Error: Missing secret");
        }

        const user: any = jwt.verify(token, accessTokenSecret);

        if (!user.admin) {
            return res.status(403).send("Forbidden: Admins only");
        }

        (req as any).user = user;
        next();
    } catch (error) {
        return res.status(403).send("Forbidden: Invalid token");
    }
};
