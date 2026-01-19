"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesController = void 0;
const modules_service_1 = require("../services/modules.service");
const modulesService = new modules_service_1.ModulesService();
class ModulesController {
    async create(req, res) {
        try {
            const module = await modulesService.create(req.body);
            res.status(201).json({ data: module });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findAll(req, res) {
        try {
            const { courseId } = req.params;
            const modules = await modulesService.findAll(courseId);
            res.json({ data: modules });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async findOne(req, res) {
        try {
            const { id } = req.params;
            const module = await modulesService.findOne(id);
            if (!module)
                return res.status(404).json({ error: 'Module not found' });
            res.json({ data: module });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const module = await modulesService.update(id, req.body);
            res.json({ data: module });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await modulesService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async reorder(req, res) {
        try {
            const { courseId } = req.params;
            const { moduleIds } = req.body;
            await modulesService.reorder(courseId, moduleIds);
            res.status(200).json({ message: 'Modules reordered successfully' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.ModulesController = ModulesController;
