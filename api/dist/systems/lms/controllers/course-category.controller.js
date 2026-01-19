"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseCategoryController = exports.CourseCategoryController = void 0;
const course_category_service_1 = require("../services/course-category.service");
class CourseCategoryController {
    async findAll(req, res) {
        try {
            const categories = await course_category_service_1.courseCategoryService.findAll();
            res.json({ data: categories });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async findById(req, res) {
        try {
            const category = await course_category_service_1.courseCategoryService.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.json({ data: category });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async create(req, res) {
        try {
            const category = await course_category_service_1.courseCategoryService.create(req.body);
            res.status(201).json({ data: category });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const category = await course_category_service_1.courseCategoryService.update(req.params.id, req.body);
            res.json({ data: category });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            await course_category_service_1.courseCategoryService.delete(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.CourseCategoryController = CourseCategoryController;
exports.courseCategoryController = new CourseCategoryController();
