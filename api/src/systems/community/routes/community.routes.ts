import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const communityRouter = Router();
const controller = new CommunityController();

// Forum Routes
communityRouter.get('/forum/categories', controller.getCategories);
communityRouter.get('/forum/threads', controller.getThreads);
communityRouter.get('/forum/threads/:id', controller.getThread);
communityRouter.post('/forum/threads', authenticate, controller.createThread);
communityRouter.post('/forum/posts', authenticate, controller.createPost);
communityRouter.post('/forum/upvote', authenticate, controller.toggleUpvote);

// Event Routes
communityRouter.get('/events', controller.getEvents);
communityRouter.get('/events/:id', controller.getEvent);
communityRouter.post('/events/:id/register', authenticate, controller.registerEvent);

export { communityRouter };
