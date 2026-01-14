import { prisma } from '../../../lib/prisma';
import { Prisma, ArticleStatus } from '@prisma/client';

export class ArticleService {
    /**
     * Get articles with filters and pagination
     */
    async getArticles(params: {
        categoryId?: string;
        tag?: string;
        search?: string;
        status?: ArticleStatus;
        featured?: boolean;
        authorId?: string;
        page?: number;
        limit?: number;
        sort?: 'newest' | 'popular' | 'mostViewed';
    }) {
        const {
            categoryId,
            tag,
            search,
            status = ArticleStatus.PUBLISHED,
            featured,
            authorId,
            page = 1,
            limit = 12,
            sort = 'newest'
        } = params;

        const skip = (page - 1) * limit;
        const where: Prisma.ArticleWhereInput = { status };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (tag) {
            where.tags = {
                some: {
                    name: { equals: tag, mode: 'insensitive' }
                }
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (featured !== undefined) {
            where.isFeatured = featured;
        }

        if (authorId) {
            where.authorId = authorId;
        }

        let orderBy: Prisma.ArticleOrderByWithRelationInput;
        switch (sort) {
            case 'popular':
                orderBy = { likeCount: 'desc' };
                break;
            case 'mostViewed':
                orderBy = { viewCount: 'desc' };
                break;
            default:
                orderBy = { publishedAt: 'desc' };
        }

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            fullName: true,
                            profilePictureUrl: true
                        }
                    },
                    category: true,
                    tags: true,
                    _count: {
                        select: {
                            comments: true,
                            likes: true
                        }
                    }
                },
                orderBy,
                skip,
                take: limit
            }),
            prisma.article.count({ where })
        ]);

        return {
            data: articles,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get single article by slug
     */
    async getArticle(slug: string, userId?: string) {
        const article = await prisma.article.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true,
                        businessName: true
                    }
                },
                category: true,
                tags: true,
                comments: {
                    where: { status: 'ACTIVE' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePictureUrl: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        if (article) {
            // Increment view count
            await prisma.article.update({
                where: { id: article.id },
                data: { viewCount: { increment: 1 } }
            });

            // Check if user liked the article
            if (userId) {
                const userLike = await prisma.articleLike.findUnique({
                    where: {
                        userId_articleId: {
                            userId,
                            articleId: article.id
                        }
                    }
                });
                (article as any).userHasLiked = !!userLike;
            }
        }

        return article;
    }

    /**
     * Create new article
     */
    async createArticle(data: {
        title: string;
        content: string;
        excerpt?: string;
        coverImage?: string;
        authorId: string;
        categoryId?: string;
        tags?: string[];
        status?: ArticleStatus;
        isFeatured?: boolean;
    }) {
        const slug = this.generateSlug(data.title);

        const article = await prisma.article.create({
            data: {
                title: data.title,
                slug,
                content: data.content,
                excerpt: data.excerpt,
                coverImage: data.coverImage,
                authorId: data.authorId,
                categoryId: data.categoryId,
                status: data.status || ArticleStatus.DRAFT,
                isFeatured: data.isFeatured || false,
                publishedAt: data.status === ArticleStatus.PUBLISHED ? new Date() : null,
                tags: data.tags ? {
                    create: data.tags.map(tag => ({ name: tag }))
                } : undefined
            },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true
                    }
                },
                category: true,
                tags: true
            }
        });

        return article;
    }

    /**
     * Update article
     */
    async updateArticle(
        id: string,
        data: {
            title?: string;
            content?: string;
            excerpt?: string;
            coverImage?: string;
            categoryId?: string;
            tags?: string[];
            status?: ArticleStatus;
            isFeatured?: boolean;
        }
    ) {
        const updateData: Prisma.ArticleUpdateInput = {};

        if (data.title) {
            updateData.title = data.title;
            updateData.slug = this.generateSlug(data.title);
        }

        if (data.content !== undefined) updateData.content = data.content;
        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
        if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
        if (data.categoryId !== undefined) updateData.category = { connect: { id: data.categoryId } };
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;

        // Update status and publish date
        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === ArticleStatus.PUBLISHED) {
                const existing = await prisma.article.findUnique({ where: { id }, select: { publishedAt: true } });
                if (!existing?.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
        }

        // Update tags
        if (data.tags) {
            await prisma.articleTag.deleteMany({ where: { articleId: id } });
            updateData.tags = {
                create: data.tags.map(tag => ({ name: tag }))
            };
        }

        const article = await prisma.article.update({
            where: { id },
            data: updateData,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true
                    }
                },
                category: true,
                tags: true
            }
        });

        return article;
    }

    /**
     * Delete article (soft delete by archiving)
     */
    async deleteArticle(id: string) {
        return await prisma.article.update({
            where: { id },
            data: { status: ArticleStatus.ARCHIVED }
        });
    }

    /**
     * Toggle like on article
     */
    async toggleLike(articleId: string, userId: string) {
        const existing = await prisma.articleLike.findUnique({
            where: {
                userId_articleId: {
                    userId,
                    articleId
                }
            }
        });

        if (existing) {
            // Unlike
            await prisma.articleLike.delete({
                where: {
                    userId_articleId: {
                        userId,
                        articleId
                    }
                }
            });
            await prisma.article.update({
                where: { id: articleId },
                data: { likeCount: { decrement: 1 } }
            });
            return { liked: false };
        } else {
            // Like
            await prisma.articleLike.create({
                data: { userId, articleId }
            });
            await prisma.article.update({
                where: { id: articleId },
                data: { likeCount: { increment: 1 } }
            });
            return { liked: true };
        }
    }

    /**
     * Add comment to article
     */
    async addComment(articleId: string, userId: string, content: string) {
        const comment = await prisma.articleComment.create({
            data: {
                articleId,
                userId,
                content
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true
                    }
                }
            }
        });

        // Increment comment count
        await prisma.article.update({
            where: { id: articleId },
            data: { commentCount: { increment: 1 } }
        });

        return comment;
    }

    /**
     * Delete comment
     */
    async deleteComment(commentId: string) {
        const comment = await prisma.articleComment.update({
            where: { id: commentId },
            data: { status: 'DELETED' }
        });

        // Decrement comment count
        await prisma.article.update({
            where: { id: comment.articleId },
            data: { commentCount: { decrement: 1 } }
        });

        return comment;
    }

    /**
     * Get article categories
     */
    async getCategories() {
        return await prisma.articleCategory.findMany({
            include: {
                _count: {
                    select: { articles: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Get popular articles
     */
    async getPopularArticles(limit: number = 5) {
        return await prisma.article.findMany({
            where: { status: ArticleStatus.PUBLISHED },
            orderBy: [
                { viewCount: 'desc' },
                { likeCount: 'desc' }
            ],
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                viewCount: true,
                likeCount: true,
                publishedAt: true,
                author: {
                    select: {
                        fullName: true
                    }
                }
            }
        });
    }

    /**
     * Get featured articles
     */
    async getFeaturedArticles(limit: number = 3) {
        return await prisma.article.findMany({
            where: {
                status: ArticleStatus.PUBLISHED,
                isFeatured: true
            },
            orderBy: { publishedAt: 'desc' },
            take: limit,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        profilePictureUrl: true
                    }
                },
                category: true,
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });
    }

    /**
     * Generate URL-friendly slug from title
     */
    private generateSlug(title: string): string {
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${slug}-${randomSuffix}`;
    }
}
