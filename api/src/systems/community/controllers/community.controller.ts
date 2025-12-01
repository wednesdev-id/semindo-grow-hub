import { Request, Response } from 'express';
import { ForumService } from '../services/forum.service';
import { EventService } from '../services/event.service';

const forumService = new ForumService();
const eventService = new EventService();

export class CommunityController {
    // Forum
    async getCategories(req: Request, res: Response) {
        try {
            const categories = await forumService.getCategories();
            res.json({ status: 'success', data: categories });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    async getThreads(req: Request, res: Response) {
        try {
            const { categoryId, page, limit, search, sort } = req.query;
            const result = await forumService.getThreads({
                categoryId: categoryId as string,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                search: search as string,
                sort: sort as 'newest' | 'popular'
            });
            res.json({ status: 'success', ...result });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch threads' });
        }
    }

    async getThread(req: Request, res: Response) {
        try {
            const thread = await forumService.getThread(req.params.id);
            if (!thread) return res.status(404).json({ error: 'Thread not found' });
            res.json({ status: 'success', data: thread });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch thread' });
        }
    }

    async createThread(req: Request, res: Response) {
        try {
            // Assuming auth middleware populates req.user
            const authorId = (req as any).user?.id;
            if (!authorId) return res.status(401).json({ error: 'Unauthorized' });

            const thread = await forumService.createThread({
                ...req.body,
                authorId
            });
            res.status(201).json({ status: 'success', data: thread });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create thread' });
        }
    }

    async createPost(req: Request, res: Response) {
        try {
            const authorId = (req as any).user?.id;
            if (!authorId) return res.status(401).json({ error: 'Unauthorized' });

            const post = await forumService.createPost({
                ...req.body,
                authorId
            });
            res.status(201).json({ status: 'success', data: post });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create post' });
        }
    }

    async toggleUpvote(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const { type, id } = req.body; // type: 'thread' | 'post'
            const result = await forumService.toggleUpvote(type, id, userId);
            res.json({ status: 'success', data: result });
        } catch (error) {
            res.status(500).json({ error: 'Failed to toggle upvote' });
        }
    }

    // Events
    async getEvents(req: Request, res: Response) {
        try {
            const { type, search, page, limit } = req.query;
            const result = await eventService.getEvents({
                type: type as 'online' | 'offline',
                search: search as string,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined
            });
            res.json({ status: 'success', ...result });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch events' });
        }
    }

    async getEvent(req: Request, res: Response) {
        try {
            const event = await eventService.getEvent(req.params.id);
            if (!event) return res.status(404).json({ error: 'Event not found' });
            res.json({ status: 'success', data: event });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch event' });
        }
    }

    async registerEvent(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const registration = await eventService.registerEvent(req.params.id, userId);
            res.status(201).json({ status: 'success', data: registration });
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Failed to register for event' });
        }
    }
}
