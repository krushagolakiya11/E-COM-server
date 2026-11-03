import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";

import userRoutes from "./router/userRoutes";
import categoryRouter from "./router/categoryRouter"
import productRouter from "./router/productRouter"

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("server is running !");
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})