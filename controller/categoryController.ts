import knex from "../config/knex";
import { Request, Response } from "express";

// get all categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await knex("categories").select("*").orderBy("name", "asc");
        res.status(200).json({success: true, data: categories})
    } catch (error: any) {
        res.status(500).json({success: false, message: "Failed to fetch categories", error: error.message});
    }
}

// get one category
export const getCategoryById = async (req: Request<{id: string}>, res: Response): Promise<void> => {
    try {
        const category = await knex("categories").where({ id: req.params.id}).first();
        if(!category){
            res.status(404).json({success: false, message: "Category not found"});
            return;
        }
        res.status(200).json(category);
    } catch (error: any) {
        res.status(500).json({
            success: false, message: "Failed to fetch category", error: error.message
        })
    }
}

// create  category
export const createCategory = async(req: Request, res: Response): Promise<void> => {
    try {
         const name = req.body.name?.trim();
    if(!name){
        res.status(400).json({success: false, message: "Category name is required"});
        return;
    }
    const [category] = await knex("categories").insert({name}).returning("*");
    res.status(200).json({success: true, data: category});
    } catch (error: any) {
        res.status(500).json({success: false, message: "Internal Server error", error: error.message});
        return
    }
}

// update category
export const updateCategory = async(req: Request, res: Response): Promise<void> => {
    try {
        const name = req.body.name?.trim();
    if(!name){
        res.status(400).json({success: false, message: "Category name is required"});
        return;
    }
    const category = await knex("categories").where({id: req.params.id}).update({name}).returning("*");
    if(!category){
        res.status(404).json({success: false, message: "Category not found"});
        return;
    }
    res.status(200).json(category);
    } catch (error: any) {
        res.status(500).json({success: false, message: "Internal Server error", error: error.message});
        return;
    }
}

// delete categoty
export const deleteCategory = async(req: Request<{id: string}>, res: Response): Promise<void> => {
    try {
        const deleted = await knex("categories").where({id: req.params.id}).del();
    if(!deleted){
        res.status(404).json({success: false, message: "Category not found"});
        return;
    }
    res.status(200).json({success: true, message: "Category deleted successfully"})
    } catch (error: any) {
        res.status(500).json({success: false, message: error.message});
        return;
    }
}