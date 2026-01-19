"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityRouter = void 0;
const express_1 = require("express");
const community_controller_1 = require("../controllers/community.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const communityRouter = (0, express_1.Router)();
exports.communityRouter = communityRouter;
const controller = new community_controller_1.CommunityController();
// Forum Routes
communityRouter.get('/forum/categories', controller.getCategories);
communityRouter.get('/forum/threads', controller.getThreads);
communityRouter.get('/forum/threads/:id', controller.getThread);
communityRouter.post('/forum/threads', auth_middleware_1.authenticate, controller.createThread);
communityRouter.post('/forum/posts', auth_middleware_1.authenticate, controller.createPost);
communityRouter.post('/forum/upvote', auth_middleware_1.authenticate, controller.toggleUpvote);
// Event Routes
communityRouter.get('/events', controller.getEvents);
communityRouter.get('/events/:id', controller.getEvent);
communityRouter.post('/events/:id/register', auth_middleware_1.authenticate, controller.registerEvent);
