"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsController = void 0;
const lessons_service_1 = require("../services/lessons.service");
const lessonsService = new lessons_service_1.LessonsService();
class LessonsController {
    async create(req, res) {
        try {
            const lesson = await lessonsService.create(req.body);
            res.status(201).json({ data: lesson });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findAll(req, res) {
        try {
            const { moduleId } = req.params;
            const lessons = await lessonsService.findAll(moduleId);
            res.json({ data: lessons });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findOne(req, res) {
        try {
            const { id } = req.params;
            const lesson = await lessonsService.findOne(id);
            if (!lesson)
                return res.status(404).json({ error: 'Lesson not found' });
            res.json({ data: lesson });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const lesson = await lessonsService.update(id, req.body);
            res.json({ data: lesson });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await lessonsService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async reorder(req, res) {
        try {
            const { moduleId } = req.params;
            const { lessonIds } = req.body;
            await lessonsService.reorder(moduleId, lessonIds);
            res.status(200).json({ message: 'Lessons reordered successfully' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.LessonsController = LessonsController;
