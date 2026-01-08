import { Request, Response } from 'express';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from '../types/roles.types';

const rolesService = new RolesService();

export class RolesController {
    async findAll(req: Request, res: Response) {
        try {
            const result = await rolesService.findAll();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const result = await rolesService.findById(req.params.id);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const result = await rolesService.create(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const result = await rolesService.update(req.params.id, req.body);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result = await rolesService.delete(req.params.id);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getUsersByRole(req: Request, res: Response) {
        try {
            const result = await rolesService.getUsersByRole(req.params.id);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async getRolePermissions(req: Request, res: Response) {
        try {
            const result = await rolesService.getRolePermissions(req.params.id);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async assignPermissions(req: Request, res: Response) {
        try {
            const { permissionIds } = req.body;
            const result = await rolesService.assignPermissions(req.params.id, permissionIds);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async removePermission(req: Request, res: Response) {
        try {
            const result = await rolesService.removePermission(req.params.id, req.params.permissionId);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
