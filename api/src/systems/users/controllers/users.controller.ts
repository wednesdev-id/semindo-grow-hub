
import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../types/users.types';

const usersService = new UsersService()

export class UsersController {
    async findAll(req: Request, res: Response) {
        try {
            const result = await usersService.findAll(req.query)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const result = await usersService.findById(req.params.id)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message })
        }
    }

    async create(req: Request, res: Response) {
        try {
            const result = await usersService.create(req.body)
            res.status(201).json({ success: true, data: result })
        } catch (error: any) {
            console.error('Error creating user:', error)
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async update(req: Request, res: Response) {
        try {
            const result = await usersService.update(req.params.id, req.body)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result = await usersService.delete(req.params.id)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
}
