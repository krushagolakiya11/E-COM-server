import { Request, Response } from "express";
import knex from "../config/knex";
import bcrypt from "bcryptjs"
import jwt, { type SignOptions } from "jsonwebtoken"

interface LoginRequest{
    email: string;
    password: string;
}

interface CreateUserBody {
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone: string,
    gender: "male" | "female" | "other",
    dob?: string | null;
}

interface UpdateUserBody{
   first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone: string,
    gender: "male" | "female" | "other",
    dob?: string | null; 
}

interface SafeUser{
    id: number,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone: string,
    gender: "male" | "female" | "other",
    dob: string | null,
    is_verified: boolean;
}

// login
export const login = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            res.status(400).json({ message: "Email and passwords are required" });
            return;
        }

        const user = await knex("users").where({ email }).first();
        if(!user){
            res.status(401).json({ message: "Invalid credentials"});
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(401).json({message: "Invalid credentials"});
            return;
        }

        const secret = process.env.JWT_SECRET;
        if(!secret){
            res.status(500).json({message: "JWT_SECRET is not configured"});
            return;
        }

        const options: SignOptions = {
            expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"]
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            secret,
            options
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            }
        })
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}

// get all users — safe fields only, with pagination
export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
        const limit = Math.min(100, parseInt(String(req.query.limit ?? "20"), 10) || 20);
        const offset = (page - 1) * limit;

        const users: SafeUser[] = await knex("users")
            .select("id", "first_name", "last_name", "email", "password", "phone", "gender", "dob", "is_verified")
            .limit(limit)
            .offset(offset)
            .orderBy("id", "asc");

        const [{ count }] = await knex("users").count("id as count");

        res.status(200).json({
            data: users,
            meta: { page, limit, total: parseInt(String(count)) },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// create user
export const createUser = async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
    try {
        const { first_name, last_name, email, password, phone, gender, dob } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be atleast 8 characters' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [user] = await knex("users")
            .insert({ first_name, last_name, email, password: hashedPassword, phone, gender, dob })
            .returning(["id", "first_name", "last_name", "email", "password", "phone", "gender", "dob", "is_verified"]);

        res.status(201).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// update user — allowlist to prevent mass-assignment
export const updateUser = async (req: Request<{id: string}, {}, UpdateUserBody>, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Only allow safe fields to be updated
        const { first_name, last_name, email, password, phone, gender, dob } = req.body;
        const updates: Record<string, unknown> = {};
        if (first_name !== undefined) updates.first_name = first_name;
        if (last_name !== undefined) updates.last_name = last_name;
        if (email !== undefined) updates.email = email;
        if (password !== undefined) updates.password = password;
        if (phone !== undefined) updates.phone = phone;
        if (gender !== undefined) updates.gender = gender;
        if (dob !== undefined) updates.dob = dob;

        if (password !== undefined) {
            if (password.length < 8) {
                res.status(400).json({ message: "password must be atleast 8 characters" })
                return;
            }
            updates.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ message: "No valid fields provided to update" });
            return;
        }

        const [user] = await knex("users")
            .where({ id })
            .update(updates)
            .returning(["id", "first_name", "last_name", "email", "password", "phone", "gender", "dob", "is_verified"]);

        if (!user) {
            res.status(404).json({ message: "User Not Found" });
            return;
        }

        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// delete user
export const deleteUser = async (req: Request<{id: string}>, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await knex("users").where({ id }).del();

        if (!deleted) {
            res.status(404).json({ message: "User Not Found" });
            return;
        }

        res.status(200).json({ message: "User Deleted Successfully" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};