"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_service_1 = require("../services/users.service");
const usersService = new users_service_1.UsersService();
class UsersController {
    async findAll(req, res) {
        try {
            const result = await usersService.findAll(req.query);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async findById(req, res) {
        try {
            const result = await usersService.findById(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    async create(req, res) {
        try {
            const result = await usersService.create(req.body);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async update(req, res) {
        try {
            const result = await usersService.update(req.params.id, req.body);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const result = await usersService.delete(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.UsersController = UsersController;
