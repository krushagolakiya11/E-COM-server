const knex = require("../config/knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            res.status(400).json({ message: "Email and passwords are required" })
        }

        const user = await knex("users").where({ email }).first();
        if(!user){
            return res.status(401).json({ message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN || "1d"}
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
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// get all users — safe fields only, with pagination
exports.getUser = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const offset = (page - 1) * limit;

        const users = await knex("users")
            .select("id", "first_name", "last_name", "email", "password", "phone", "gender", "dob", "is_verified")
            .limit(limit)
            .offset(offset)
            .orderBy("id", "asc");

        const [{ count }] = await knex("users").count("id as count");

        res.status(200).json({
            data: users,
            meta: { page, limit, total: parseInt(count) },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create user
exports.createUser = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update user — allowlist to prevent mass-assignment
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Only allow safe fields to be updated
        const { first_name, last_name, email, password, phone, gender, dob } = req.body;
        const updates = {};
        if (first_name !== undefined) updates.first_name = first_name;
        if (last_name !== undefined) updates.last_name = last_name;
        if (email !== undefined) updates.email = email;
        if (password !== undefined) updates.password = password;
        if (phone !== undefined) updates.phone = phone;
        if (gender !== undefined) updates.gender = gender;
        if (dob !== undefined) updates.dob = dob;

        if (password !== undefined) {
            if (password.length < 8) {
                return res.status(400).json({ message: "password must be atleast 8 characters" })
            }
            updates.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields provided to update" });
        }

        const [user] = await knex("users")
            .where({ id })
            .update(updates)
            .returning(["id", "first_name", "last_name", "email", "password", "phone", "gender", "dob", "is_verified"]);

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await knex("users").where({ id }).del();

        if (!deleted) {
            return res.status(404).json({ message: "User Not Found" });
        }

        res.status(200).json({ message: "User Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};