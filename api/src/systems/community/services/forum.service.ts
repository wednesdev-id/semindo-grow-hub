import { prisma } from '../../../lib/prisma';
import { Prisma } from "@prisma/client";

export class ForumService {
    async getCategories() {
        return prisma.forumCategory.findMany({
            orderBy: { order: "asc" },
            include: {
                _count: {
                    select: { threads: true }
                }
            }
        });
    }

    async getThreads(params: { categoryId?: string; page?: number; limit?: number; search?: string; sort?: 'newest' | 'popular' }) {
        const { categoryId, page = 1, limit = 10, search, sort = 'newest' } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ForumThreadWhereInput = {};

        if (categoryId && categoryId !== 'all') {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } }
            ];
        }

        const orderBy: Prisma.ForumThreadOrderByWithRelationInput = sort === 'popular'
            ? { views: 'desc' }
            : { createdAt: 'desc' };

        const [threads, total] = await Promise.all([
            prisma.forumThread.findMany({
                where,
                include: {
                    author: {
                        select: { id: true, fullName: true, businessName: true }
                    },
                    category: true,
                    _count: {
                        select: { posts: true, upvotes: true }
                    }
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.forumThread.count({ where })
        ]);

        return {
            data: threads,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getThread(id: string) {
        const thread = await prisma.forumThread.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, fullName: true, businessName: true }
                },
                category: true,
                posts: {
                    include: {
                        author: {
                            select: { id: true, fullName: true, businessName: true }
                        },
                        upvotes: true
                    },
                    orderBy: { createdAt: 'asc' }
                },
                _count: {
                    select: { upvotes: true }
                },
                upvotes: true // To check if current user upvoted
            }
        });

        if (thread) {
            // Increment views
            await prisma.forumThread.update({
                where: { id },
                data: { views: { increment: 1 } }
            });
        }

        return thread;
    }

    async createThread(data: { title: string; content: string; categoryId: string; authorId: string }) {
        return prisma.forumThread.create({
            data: {
                title: data.title,
                content: data.content,
                categoryId: data.categoryId,
                authorId: data.authorId
            }
        });
    }

    async createPost(data: { content: string; threadId: string; authorId: string; parentId?: string }) {
        return prisma.forumPost.create({
            data: {
                content: data.content,
                threadId: data.threadId,
                authorId: data.authorId,
                parentId: data.parentId
            },
            include: {
                author: {
                    select: { id: true, fullName: true, businessName: true }
                }
            }
        });
    }

    async toggleUpvote(type: 'thread' | 'post', id: string, userId: string) {
        const where: Prisma.ForumUpvoteWhereUniqueInput = {
            userId_threadId_postId: {
                userId,
                threadId: type === 'thread' ? id : "", // Prisma requires unique constraint fields
                postId: type === 'post' ? id : ""
            }
        };

        // Prisma composite unique constraints with nullable fields are tricky.
        // We'll use findFirst instead.
        const existing = await prisma.forumUpvote.findFirst({
            where: {
                userId,
                threadId: type === 'thread' ? id : null,
                postId: type === 'post' ? id : null
            }
        });

        if (existing) {
            await prisma.forumUpvote.delete({ where: { id: existing.id } });
            return { upvoted: false };
        } else {
            await prisma.forumUpvote.create({
                data: {
                    userId,
                    threadId: type === 'thread' ? id : null,
                    postId: type === 'post' ? id : null
                }
            });
            return { upvoted: true };
        }
    }
}
