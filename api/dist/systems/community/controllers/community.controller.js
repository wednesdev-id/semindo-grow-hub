"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityController = void 0;
const forum_service_1 = require("../services/forum.service");
const event_service_1 = require("../services/event.service");
const forumService = new forum_service_1.ForumService();
const eventService = new event_service_1.EventService();
class CommunityController {
    // Forum
    async getCategories(req, res) {
        try {
            const categories = await forumService.getCategories();
            res.json({ status: 'success', data: categories });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }
    async getThreads(req, res) {
        try {
            const { categoryId, page, limit, search, sort } = req.query;
            const result = await forumService.getThreads({
                categoryId: categoryId,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search,
                sort: sort
            });
            res.json({ status: 'success', ...result });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch threads' });
        }
    }
    async getThread(req, res) {
        try {
            const thread = await forumService.getThread(req.params.id);
            if (!thread)
                return res.status(404).json({ error: 'Thread not found' });
            res.json({ status: 'success', data: thread });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch thread' });
        }
    }
    async createThread(req, res) {
        try {
            // Assuming auth middleware populates req.user
            const authorId = req.user?.id;
            if (!authorId)
                return res.status(401).json({ error: 'Unauthorized' });
            const thread = await forumService.createThread({
                ...req.body,
                authorId
            });
            res.status(201).json({ status: 'success', data: thread });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create thread' });
        }
    }
    async createPost(req, res) {
        try {
            const authorId = req.user?.id;
            if (!authorId)
                return res.status(401).json({ error: 'Unauthorized' });
            const post = await forumService.createPost({
                ...req.body,
                authorId
            });
            res.status(201).json({ status: 'success', data: post });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create post' });
        }
    }
    async toggleUpvote(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ error: 'Unauthorized' });
            const { type, id } = req.body; // type: 'thread' | 'post'
            const result = await forumService.toggleUpvote(type, id, userId);
            res.json({ status: 'success', data: result });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to toggle upvote' });
        }
    }
    // Events
    async getEvents(req, res) {
        try {
            const { type, search, page, limit } = req.query;
            const result = await eventService.getEvents({
                type: type,
                search: search,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined
            });
            res.json({ status: 'success', ...result });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch events' });
        }
    }
    async getEvent(req, res) {
        try {
            const event = await eventService.getEvent(req.params.id);
            if (!event)
                return res.status(404).json({ error: 'Event not found' });
            res.json({ status: 'success', data: event });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch event' });
        }
    }
    async registerEvent(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ error: 'Unauthorized' });
            const registration = await eventService.registerEvent(req.params.id, userId);
            res.status(201).json({ status: 'success', data: registration });
        }
        catch (error) {
            res.status(400).json({ error: error.message || 'Failed to register for event' });
        }
    }
}
exports.CommunityController = CommunityController;
