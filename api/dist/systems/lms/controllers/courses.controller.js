"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesController = void 0;
const courses_service_1 = require("../services/courses.service");
const coursesService = new courses_service_1.CoursesService();
class CoursesController {
    async create(req, res) {
        try {
            const userId = req.user.userId;
            const data = {
                ...req.body,
                author: { connect: { id: userId } },
                slug: req.body.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
            };
            const course = await coursesService.create(data);
            res.status(201).json({ data: course });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findAll(req, res) {
        try {
            const { skip, take, category, level, search } = req.query;
            const where = {};
            if (category)
                where.category = String(category);
            if (level)
                where.level = String(level);
            if (search) {
                where.OR = [
                    { title: { contains: String(search), mode: 'insensitive' } },
                    { description: { contains: String(search), mode: 'insensitive' } },
                ];
            }
            const courses = await coursesService.findAll({
                skip: skip ? Number(skip) : undefined,
                take: take ? Number(take) : undefined,
                where,
                orderBy: { createdAt: 'desc' },
            });
            res.json({ data: courses });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findOne(req, res) {
        try {
            const { id } = req.params;
            const course = await coursesService.findOne(id);
            if (!course)
                return res.status(404).json({ error: 'Course not found' });
            res.json({ data: course });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findBySlug(req, res) {
        try {
            const { slug } = req.params;
            const course = await coursesService.findBySlug(slug);
            if (!course)
                return res.status(404).json({ error: 'Course not found' });
            res.json({ data: course });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const course = await coursesService.update({
                where: { id },
                data,
            });
            res.json({ data: course });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await coursesService.delete({ id });
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async enroll(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const enrollment = await coursesService.enroll(userId, id);
            res.status(201).json({ data: enrollment });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getMyCourses(req, res) {
        try {
            const userId = req.user.userId;
            const courses = await coursesService.getMyCourses(userId);
            res.json({ data: courses });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateProgress(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params; // lessonId
            const { completed } = req.body;
            const progress = await coursesService.updateProgress(userId, id, completed);
            res.json({ data: progress });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.CoursesController = CoursesController;
