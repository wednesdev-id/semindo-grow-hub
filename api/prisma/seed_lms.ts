import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple random helpers to replace faker
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
    console.log('Seeding LMS data...');

    // 1. Get or Create Instructor
    // Find a user with admin role
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    let instructor: any = null;

    if (adminRole) {
        const userRole = await prisma.userRole.findFirst({
            where: { roleId: adminRole.id },
            include: { user: true }
        });
        if (userRole) {
            instructor = userRole.user;
            console.log('Using existing admin as instructor:', instructor.email);
        }
    }

    if (!instructor) {
        // Fallback: try to find any user
        instructor = await prisma.user.findFirst();
        if (instructor) {
            console.log('Using first found user as instructor:', instructor.email);
        } else {
            console.log('No user found. Please seed users first.');
            return;
        }
    }

    // 2. Create Categories
    const categories = ['Digital Marketing', 'Finance', 'Business Strategy', 'Technology'];
    for (const catName of categories) {
        const slug = catName.toLowerCase().replace(/\s+/g, '-');
        await prisma.courseCategory.upsert({
            where: { slug },
            update: {},
            create: {
                name: catName,
                slug,
                description: `Courses about ${catName}`
            },
        });
    }

    // 3. Create Course
    const courseTitle = 'Mastering Digital Marketing for UMKM';
    const courseSlug = 'mastering-digital-marketing-' + randomInt(1000, 9999);

    const course = await prisma.course.create({
        data: {
            title: courseTitle,
            slug: courseSlug,
            description: 'Learn how to master digital marketing strategies for your UMKM business. This course covers social media, content creation, and more.',
            price: 500000,
            level: 'Beginner',
            category: 'Digital Marketing',
            isPublished: true,
            authorId: instructor.id,
            thumbnailUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        },
    });

    console.log('Created course:', course.title);

    // 4. Create Modules
    const modules = [
        { title: 'Introduction', order: 1 },
        { title: 'Social Media Strategy', order: 2 },
        { title: 'Content Creation', order: 3 },
    ];

    for (const m of modules) {
        const module = await prisma.module.create({
            data: {
                title: m.title,
                order: m.order,
                courseId: course.id,
            },
        });

        // 5. Create Lessons
        // Video Lesson
        await prisma.lesson.create({
            data: {
                title: `Welcome to ${m.title}`,
                slug: `welcome-${m.title.toLowerCase().replace(/\s+/g, '-')}-${randomInt(1000, 9999)}`,
                type: 'video',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
                duration: 300,
                order: 1,
                isFree: true,
                moduleId: module.id,
            },
        });

        // Article Lesson
        await prisma.lesson.create({
            data: {
                title: `Reading: Understanding ${m.title}`,
                slug: `reading-${m.title.toLowerCase().replace(/\s+/g, '-')}-${randomInt(1000, 9999)}`,
                type: 'article',
                content: 'This is a placeholder content for the article lesson. It would contain detailed text about the topic.',
                order: 2,
                isFree: false,
                moduleId: module.id,
            },
        });

        // Quiz Lesson (only for 2nd module)
        if (m.order === 2) {
            const quizLesson = await prisma.lesson.create({
                data: {
                    title: 'Knowledge Check',
                    slug: `quiz-${m.title.toLowerCase().replace(/\s+/g, '-')}-${randomInt(1000, 9999)}`,
                    type: 'quiz',
                    order: 3,
                    isFree: false,
                    moduleId: module.id,
                }
            });

            // Create Quiz
            await prisma.quiz.create({
                data: {
                    lessonId: quizLesson.id,
                    title: 'Module Quiz',
                    description: 'Test your knowledge',
                    passingScore: 70,
                    questions: {
                        create: [
                            {
                                text: 'What is the most important social media metric?',
                                type: 'multiple_choice',
                                points: 10,
                                options: ['Likes', 'Shares', 'Engagement Rate', 'Followers'],
                                order: 1
                            },
                            {
                                text: 'Content is King?',
                                type: 'boolean',
                                points: 5,
                                options: ['True', 'False'],
                                order: 2
                            }
                        ]
                    }
                }
            });
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
