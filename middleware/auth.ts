import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

type AuthPayload = JwtPayload & {
    id: number;
    email: string;
}

export default (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: "JWT not configured" });
            return;
        }
        const decoded = jwt.verify(token, secret);
        if (typeof decoded == "string" || typeof decoded.id !== "number" || typeof decoded.email !== "string" ) {
            res.status(401).json({ message: "Invalid token payload" });
            return;
        }
        req.user = decoded as AuthPayload;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}