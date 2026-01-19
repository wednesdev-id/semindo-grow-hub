"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsController = void 0;
const permissions_service_1 = require("../services/permissions.service");
const permissionsService = new permissions_service_1.PermissionsService();
class PermissionsController {
    async findAll(req, res) {
        try {
            const result = await permissionsService.findAll();
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async findById(req, res) {
        try {
            const result = await permissionsService.findById(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    async create(req, res) {
        try {
            const result = await permissionsService.create(req.body);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async update(req, res) {
        try {
            const result = await permissionsService.update(req.params.id, req.body);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const result = await permissionsService.delete(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.PermissionsController = PermissionsController;
