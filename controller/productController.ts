import knex from "../config/knex";
import { Request, Response } from "express";

interface CreateProduct{
    name: string,
    description: string,
    price: number,
    stock: number,
    brand: string,
    image: string,
    categories_id: number
}

interface UpdateProduct{
    name?: string,
    description?: string,
    price?: number,
    stock?: number,
    brand?: string,
    image?: string,
    categories_id?: number
}

// get all products
export const getProducts = async(req: Request, res: Response): Promise<void> => {
    try {
        const products = await knex("products").select("*").orderBy("name", "asc");
        res.status(200).json({success: true, data: products});
    } catch (error: any) {
        res.status(500).json({success: false, message: "Failed to fetch products", error: error.message})
    }
}

// get one product by id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = await knex("products").where({id: req.params.id}).first();
        if(!productId){
            res.status(404).json({success: false, message: "Product not found"});
            return;
        }
        res.status(200).json({success: true, data: productId})
    } catch (error: any) {
        res.status(500).json({success: false, message: "Failed to fetch product", error: error.message})
    }
}

// create product
export const createProduct =  async (req: Request<{},{}, CreateProduct>, res: Response): Promise<void> => {
    try {
        const {name, description, price, stock, brand, image, categories_id} = req.body;
        if (!name || !description || !price || !stock || !categories_id){
            res.status(400).json({success: false, message: "Please provide required fields"});
            return;
        }

        const [product] = await knex("products")
        .insert({name, description, price, stock, brand, image, categories_id})
        .returning("*");
        res.status(201).json({success: true, data: product});
    } catch (error: any) {
        res.status(500).json({success: false, message: error.message})
    }
}

// update product
export const updateProduct = async (req: Request<{id: string},{}, UpdateProduct>, res: Response): Promise<void> => {
    try {
        const {id} = req.params;

        const {name, description, price, stock, brand, image, categories_id} = req.body;
        const updates: Record<string, unknown> = {};
        if(name !== undefined) updates.name = name;
        if(description !== undefined) updates.description = description;
        if(price !== undefined) updates.price = price;
        if(stock !== undefined) updates.stock = stock;
        if(brand !== undefined) updates.brand = brand;
        if(image !== undefined) updates.image = image;
        if(categories_id !== undefined) updates.categories_id = categories_id;

        const updateProduct = await knex("products").where({id}).update(updates).returning("*");
        if(updateProduct.length === 0){
            res.status(404).json({success: false, message: "Product not found"});
            return;
        }
        res.status(200).json({success: true, data: updateProduct[0]});
    } catch (error: any) {
        res.status(500).json({success: false, message: error.message})
    }
}

// delete product
export const deleteProduct = async (req: Request<{id: string}>, res: Response): Promise<void>=>{
    try {
        const {id} = req.params;

        const deleted = await knex("products").where({id}).delete();
        if(!deleted){
            res.status(404).json({success: false, message: "Not found"});
            return;
        }
        res.status(200).json({success: true, message: "Product deleted successfully"})
    } catch (error: any) {
        res.status(500).json({success: false, message: error.message})
    }
}