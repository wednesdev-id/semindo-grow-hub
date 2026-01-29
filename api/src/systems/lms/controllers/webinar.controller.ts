import { Request, Response } from 'express';
import { WebinarService } from '../services/webinar.service';

const webinarService = new WebinarService();

export class WebinarController {
    async findAll(req: Request, res: Response) {
        try {
            const { skip, take, search, type, city, isOnline } = req.query;

            const webinars = await webinarService.findAll({
                skip: skip ? Number(skip) : undefined,
                take: take ? Number(take) : undefined,
                search: search ? String(search) : undefined,
                type: type ? String(type) : 'webinar', // Default to webinar if not specified
                city: city ? String(city) : undefined,
                isOnline: isOnline === 'true' ? true : isOnline === 'false' ? false : undefined,
            });
            res.json({ data: webinars });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const webinar = await webinarService.findOne(id);
            if (!webinar) return res.status(404).json({ error: 'Webinar not found' });
            res.json({ data: webinar });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
