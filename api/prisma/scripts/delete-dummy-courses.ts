import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDummyCourses() {
    console.log('🗑️  Starting cleanup of dummy course data...\n');

    try {
        // Find all courses
        const courses = await prisma.course.findMany({
            include: {
                modules: {
                    include: {
                        lessons: {
                            include: {
                                quiz: {
                                    include: {
                                        questions: true
                                    }
                                }
                            }
                        }
                    }
                },
                enrollments: true
            }
        });

        console.log(`Found ${courses.length} courses in database:\n`);

        for (const course of courses) {
            console.log(`📚 ${course.title}`);
            console.log(`   ID: ${course.id}`);
            console.log(`   Slug: ${course.slug}`);
            console.log(`   Modules: ${course.modules.length}`);
            console.log(`   Enrollments: ${course.enrollments.length}`);
            console.log(`   Published: ${course.isPublished}\n`);
        }

        // Ask for confirmation (would need manual intervention)
        console.log('⚠️  WARNING: This will delete ALL courses and related data!');
        console.log('Deleting the following:');
        console.log('- All quiz questions');
        console.log('- All quizzes');
        console.log('- All lessons');
        console.log('- All modules');
        console.log('- All enrollments');
        console.log('- All courses\n');

        // Delete in correct order due to foreign key constraints
        console.log('Starting deletion...\n');

        // 1. Delete quiz attempts first (if any)
        const deletedAttempts = await prisma.quizAttempt.deleteMany({});
        console.log(`✓ Deleted ${deletedAttempts.count} quiz attempts`);

        // 2. Delete quiz questions
        const deletedQuestions = await prisma.quizQuestion.deleteMany({});
        console.log(`✓ Deleted ${deletedQuestions.count} quiz questions`);

        // 3. Delete quizzes
        const deletedQuizzes = await prisma.quiz.deleteMany({});
        console.log(`✓ Deleted ${deletedQuizzes.count} quizzes`);

        // 4. Delete enrollments
        const deletedEnrollments = await prisma.enrollment.deleteMany({});
        console.log(`✓ Deleted ${deletedEnrollments.count} enrollments`);

        // 5. Delete lessons
        const deletedLessons = await prisma.lesson.deleteMany({});
        console.log(`✓ Deleted ${deletedLessons.count} lessons`);

        // 6. Delete modules
        const deletedModules = await prisma.module.deleteMany({});
        console.log(`✓ Deleted ${deletedModules.count} modules`);

        // 7. Finally delete courses
        const deletedCourses = await prisma.course.deleteMany({});
        console.log(`✓ Deleted ${deletedCourses.count} courses`);

        console.log('\n✅ All dummy course data has been successfully deleted!');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

deleteDummyCourses()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
