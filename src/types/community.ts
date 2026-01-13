export interface ForumCategory {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    icon: string | null;
    _count?: {
        threads: number;
    };
}

export interface ForumThread {
    id: string;
    title: string;
    content: string;
    authorId: string;
    categoryId: string;
    views: number;
    isPinned: boolean;
    isLocked: boolean;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        fullName: string;
        businessName: string | null;
    };
    category?: ForumCategory;
    _count?: {
        posts: number;
        upvotes: number;
    };
}

export interface ForumPost {
    id: string;
    content: string;
    threadId: string;
    authorId: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        fullName: string;
        businessName: string | null;
    };
    upvotes?: ForumUpvote[];
}

export interface ForumUpvote {
    id: string;
    userId: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    bannerUrl: string | null;
    startDate: string;
    endDate: string;
    location: string;
    type: 'online' | 'offline';
    maxParticipants: number | null;
    organizerId: string;
    createdAt: string;
    updatedAt: string;
    organizer: {
        id: string;
        fullName: string;
        businessName: string | null;
    };
    _count?: {
        registrations: number;
    };
}
