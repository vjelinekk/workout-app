import { hashSync } from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialData1764189919120 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create 2 users (IDs 2 and 3, since superadmin is ID 1)
        const traineePassword = hashSync('trainee123', 10);
        const trainerPassword = hashSync('trainer123', 10);

        await queryRunner.query(`
            INSERT INTO "user" (id, first_name, last_name, nickname, email, password, created_at, is_deleted)
            VALUES
                (2, 'John', 'Trainee', 'john_trainee', 'trainee@example.com', '${traineePassword}', NOW(), false),
                (3, 'Sarah', 'Trainer', 'sarah_trainer', 'trainer@example.com', '${trainerPassword}', NOW(), false);
        `);

        // Assign roles: user 2 gets trainee role (role_id=2), user 3 gets trainer role (role_id=3)
        await queryRunner.query(`
            INSERT INTO "user_roles" (user_id, role_id)
            VALUES
                (2, 2), -- John is a trainee
                (3, 3); -- Sarah is a trainer
        `);

        // Create 5 exercise categories
        await queryRunner.query(`
            INSERT INTO "exercise_category" (id, name, description, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (1, 'Strength Training', 'Exercises focused on building muscle strength', NOW(), false, 1, NULL, NULL),
                (2, 'Cardio', 'Cardiovascular exercises for endurance', NOW(), false, 1, NULL, NULL),
                (3, 'Flexibility', 'Stretching and mobility exercises', NOW(), false, 1, NULL, NULL),
                (4, 'Plyometric', 'Explosive power movements', NOW(), false, 1, NULL, NULL),
                (5, 'Core Training', 'Exercises targeting core muscles', NOW(), false, 1, NULL, NULL);
        `);

        // Create 10 exercises (mix of different body parts and categories)
        await queryRunner.query(`
            INSERT INTO "exercise" (id, name, body_part, equipment, description, image_url, is_public, is_approved, category_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (1, 'Bench Press', 'Chest', 'Barbell', 'Lie on a bench and press the barbell upward', NULL, true, true, 1, NOW(), false, 1, NULL, NULL),
                (2, 'Squat', 'Quadriceps', 'Barbell', 'Lower body compound exercise', NULL, true, true, 1, NOW(), false, 1, NULL, NULL),
                (3, 'Deadlift', 'Back', 'Barbell', 'Hip hinge movement lifting weight from ground', NULL, true, true, 1, NOW(), false, 1, NULL, NULL),
                (4, 'Pull-ups', 'Back', 'Pull-up Bar', 'Bodyweight pulling exercise', NULL, true, true, 1, NOW(), false, 1, NULL, NULL),
                (5, 'Running', 'Full Body', 'Treadmill', 'Cardiovascular endurance training', NULL, true, true, 2, NOW(), false, 1, NULL, NULL),
                (6, 'Bicep Curls', 'Biceps', 'Dumbbells', 'Isolated bicep exercise', NULL, true, true, 1, NOW(), false, 1, NULL, NULL),
                (7, 'Overhead Press', 'Shoulders', 'Barbell', 'Press weight overhead from shoulders', NULL, true, true, 1, NOW(), false, 1, NULL, NULL),
                (8, 'Plank', 'Core', 'Bodyweight', 'Isometric core strengthening exercise', NULL, true, true, 5, NOW(), false, 1, NULL, NULL),
                (9, 'Box Jumps', 'Quadriceps', 'Plyometric Box', 'Explosive jumping exercise', NULL, true, true, 4, NOW(), false, 1, NULL, NULL),
                (10, 'Leg Curls', 'Hamstrings', 'Machine', 'Isolated hamstring exercise', NULL, true, true, 1, NOW(), false, 1, NULL, NULL);
        `);

        // Create 10 workout session plans
        await queryRunner.query(`
            INSERT INTO "workout_session_plan" (id, name, description, is_public, is_approved, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (1, 'Upper Body Strength', 'Focus on chest, back, and arms', true, true, NOW(), false, 3, NULL, NULL),
                (2, 'Lower Body Power', 'Legs and glutes workout', true, true, NOW(), false, 3, NULL, NULL),
                (3, 'Full Body Workout', 'Complete body training session', true, true, NOW(), false, 3, NULL, NULL),
                (4, 'Push Day', 'Chest, shoulders, and triceps', true, true, NOW(), false, 3, NULL, NULL),
                (5, 'Pull Day', 'Back and biceps focus', true, true, NOW(), false, 3, NULL, NULL),
                (6, 'Cardio Blast', 'High intensity cardio session', true, true, NOW(), false, 3, NULL, NULL),
                (7, 'Core Crusher', 'Intensive core workout', true, true, NOW(), false, 3, NULL, NULL),
                (8, 'Leg Day', 'Lower body strength training', true, true, NOW(), false, 3, NULL, NULL),
                (9, 'Athletic Performance', 'Explosive power training', true, true, NOW(), false, 3, NULL, NULL),
                (10, 'Beginner Full Body', 'Entry level full body workout', true, true, NOW(), false, 3, NULL, NULL);
        `);

        // Create 5 exercises for each workout session plan (50 total)
        // Plan 1: Upper Body Strength
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (1, 1, 1, 4, '[8, 8, 8, 8]', NOW(), false, 3, NULL, NULL),
                (1, 4, 2, 3, '[10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (1, 6, 3, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (1, 7, 4, 4, '[8, 8, 8, 8]', NOW(), false, 3, NULL, NULL),
                (1, 8, 5, 3, '[60, 60, 60]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 2: Lower Body Power
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (2, 2, 1, 5, '[5, 5, 5, 5, 5]', NOW(), false, 3, NULL, NULL),
                (2, 3, 2, 4, '[6, 6, 6, 6]', NOW(), false, 3, NULL, NULL),
                (2, 10, 3, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (2, 9, 4, 4, '[10, 10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (2, 8, 5, 3, '[45, 45, 45]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 3: Full Body Workout
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (3, 2, 1, 3, '[10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (3, 1, 2, 3, '[10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (3, 4, 3, 3, '[8, 8, 8]', NOW(), false, 3, NULL, NULL),
                (3, 7, 4, 3, '[10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (3, 5, 5, 1, '[20]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 4: Push Day
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (4, 1, 1, 4, '[8, 8, 8, 8]', NOW(), false, 3, NULL, NULL),
                (4, 7, 2, 4, '[8, 8, 8, 8]', NOW(), false, 3, NULL, NULL),
                (4, 1, 3, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (4, 7, 4, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (4, 8, 5, 3, '[60, 60, 60]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 5: Pull Day
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (5, 3, 1, 4, '[6, 6, 6, 6]', NOW(), false, 3, NULL, NULL),
                (5, 4, 2, 4, '[8, 8, 8, 8]', NOW(), false, 3, NULL, NULL),
                (5, 6, 3, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (5, 4, 4, 3, '[10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (5, 6, 5, 3, '[15, 15, 15]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 6: Cardio Blast
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (6, 5, 1, 4, '[5, 5, 5, 5]', NOW(), false, 3, NULL, NULL),
                (6, 9, 2, 4, '[15, 15, 15, 15]', NOW(), false, 3, NULL, NULL),
                (6, 5, 3, 3, '[10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (6, 9, 4, 3, '[20, 20, 20]', NOW(), false, 3, NULL, NULL),
                (6, 8, 5, 3, '[30, 30, 30]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 7: Core Crusher
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (7, 8, 1, 4, '[60, 60, 60, 60]', NOW(), false, 3, NULL, NULL),
                (7, 8, 2, 4, '[45, 45, 45, 45]', NOW(), false, 3, NULL, NULL),
                (7, 8, 3, 4, '[30, 30, 30, 30]', NOW(), false, 3, NULL, NULL),
                (7, 8, 4, 4, '[90, 90, 90, 90]', NOW(), false, 3, NULL, NULL),
                (7, 8, 5, 4, '[120, 120, 120, 120]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 8: Leg Day
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (8, 2, 1, 5, '[5, 5, 5, 5, 5]', NOW(), false, 3, NULL, NULL),
                (8, 10, 2, 4, '[12, 12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (8, 2, 3, 3, '[10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (8, 10, 4, 3, '[15, 15, 15]', NOW(), false, 3, NULL, NULL),
                (8, 9, 5, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 9: Athletic Performance
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (9, 9, 1, 5, '[10, 10, 10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (9, 3, 2, 4, '[5, 5, 5, 5]', NOW(), false, 3, NULL, NULL),
                (9, 4, 3, 4, '[8, 8, 8, 8]', NOW(), false, 3, NULL, NULL),
                (9, 9, 4, 4, '[15, 15, 15, 15]', NOW(), false, 3, NULL, NULL),
                (9, 8, 5, 3, '[60, 60, 60]', NOW(), false, 3, NULL, NULL);
        `);

        // Plan 10: Beginner Full Body
        await queryRunner.query(`
            INSERT INTO "workout_session_plan_exercise" (workout_session_plan_id, exercise_id, "order", planned_sets, planned_reps_per_set, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (10, 2, 1, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (10, 1, 2, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (10, 4, 3, 3, '[10, 10, 10]', NOW(), false, 3, NULL, NULL),
                (10, 6, 4, 3, '[12, 12, 12]', NOW(), false, 3, NULL, NULL),
                (10, 8, 5, 3, '[30, 30, 30]', NOW(), false, 3, NULL, NULL);
        `);

        // Create 10 training splits
        await queryRunner.query(`
            INSERT INTO "training_split" (id, name, description, is_public, is_approved, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (1, 'Push Pull Legs', '3-day split focusing on push, pull, and leg movements', true, true, NOW(), false, 3, NULL, NULL),
                (2, 'Upper Lower Split', '4-day split alternating upper and lower body', true, true, NOW(), false, 3, NULL, NULL),
                (3, 'Full Body 3x', 'Full body workout three times per week', true, true, NOW(), false, 3, NULL, NULL),
                (4, 'Bro Split', '5-day split focusing on one muscle group per day', true, true, NOW(), false, 3, NULL, NULL),
                (5, 'Strength Program', 'Focus on compound movements and strength gains', true, true, NOW(), false, 3, NULL, NULL),
                (6, 'Cardio + Strength', 'Mixed cardio and strength training program', true, true, NOW(), false, 3, NULL, NULL),
                (7, 'Athletic Training', 'Performance-based training for athletes', true, true, NOW(), false, 3, NULL, NULL),
                (8, 'Beginner Program', 'Entry level program for new lifters', true, true, NOW(), false, 3, NULL, NULL),
                (9, 'High Volume', 'Hypertrophy-focused high volume training', true, true, NOW(), false, 3, NULL, NULL),
                (10, 'Core Focus Split', 'Training program with heavy core emphasis', true, true, NOW(), false, 3, NULL, NULL);
        `);

        // Create 5 training split days for each training split (50 total)
        // Training Split 1: Push Pull Legs
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (1, 1, 1, 4, NOW(), false, 3, NULL, NULL),
                (1, 3, 1, 5, NOW(), false, 3, NULL, NULL),
                (1, 5, 1, 2, NOW(), false, 3, NULL, NULL),
                (1, 2, 1, 7, NOW(), false, 3, NULL, NULL),
                (1, 4, 1, 6, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 2: Upper Lower Split
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (2, 1, 1, 1, NOW(), false, 3, NULL, NULL),
                (2, 2, 1, 2, NOW(), false, 3, NULL, NULL),
                (2, 4, 1, 1, NOW(), false, 3, NULL, NULL),
                (2, 5, 1, 8, NOW(), false, 3, NULL, NULL),
                (2, 6, 1, 7, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 3: Full Body 3x
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (3, 1, 1, 3, NOW(), false, 3, NULL, NULL),
                (3, 3, 1, 3, NOW(), false, 3, NULL, NULL),
                (3, 5, 1, 3, NOW(), false, 3, NULL, NULL),
                (3, 2, 1, 6, NOW(), false, 3, NULL, NULL),
                (3, 4, 1, 7, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 4: Bro Split
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (4, 1, 1, 4, NOW(), false, 3, NULL, NULL),
                (4, 2, 1, 5, NOW(), false, 3, NULL, NULL),
                (4, 3, 1, 2, NOW(), false, 3, NULL, NULL),
                (4, 4, 1, 1, NOW(), false, 3, NULL, NULL),
                (4, 5, 1, 7, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 5: Strength Program
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (5, 1, 1, 1, NOW(), false, 3, NULL, NULL),
                (5, 3, 1, 2, NOW(), false, 3, NULL, NULL),
                (5, 5, 1, 3, NOW(), false, 3, NULL, NULL),
                (5, 2, 1, 4, NOW(), false, 3, NULL, NULL),
                (5, 4, 1, 5, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 6: Cardio + Strength
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (6, 1, 1, 6, NOW(), false, 3, NULL, NULL),
                (6, 2, 1, 1, NOW(), false, 3, NULL, NULL),
                (6, 3, 1, 6, NOW(), false, 3, NULL, NULL),
                (6, 4, 1, 2, NOW(), false, 3, NULL, NULL),
                (6, 5, 1, 6, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 7: Athletic Training
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (7, 1, 1, 9, NOW(), false, 3, NULL, NULL),
                (7, 2, 1, 6, NOW(), false, 3, NULL, NULL),
                (7, 3, 1, 9, NOW(), false, 3, NULL, NULL),
                (7, 4, 1, 7, NOW(), false, 3, NULL, NULL),
                (7, 5, 1, 9, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 8: Beginner Program
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (8, 1, 1, 10, NOW(), false, 3, NULL, NULL),
                (8, 3, 1, 10, NOW(), false, 3, NULL, NULL),
                (8, 5, 1, 10, NOW(), false, 3, NULL, NULL),
                (8, 2, 1, 6, NOW(), false, 3, NULL, NULL),
                (8, 4, 1, 7, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 9: High Volume
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (9, 1, 1, 4, NOW(), false, 3, NULL, NULL),
                (9, 2, 1, 5, NOW(), false, 3, NULL, NULL),
                (9, 3, 1, 2, NOW(), false, 3, NULL, NULL),
                (9, 4, 1, 1, NOW(), false, 3, NULL, NULL),
                (9, 5, 1, 8, NOW(), false, 3, NULL, NULL);
        `);

        // Training Split 10: Core Focus Split
        await queryRunner.query(`
            INSERT INTO "training_split_day" (training_split_id, day_of_week, "order", workout_session_plan_id, created_at, is_deleted, created_by_id, updated_by_id, deleted_by_id)
            VALUES
                (10, 1, 1, 7, NOW(), false, 3, NULL, NULL),
                (10, 2, 1, 3, NOW(), false, 3, NULL, NULL),
                (10, 3, 1, 7, NOW(), false, 3, NULL, NULL),
                (10, 4, 1, 3, NOW(), false, 3, NULL, NULL),
                (10, 5, 1, 7, NOW(), false, 3, NULL, NULL);
        `);

        // Update sequences to continue from the last inserted ID
        await queryRunner.query(`
            SELECT setval(pg_get_serial_sequence('user', 'id'), (SELECT MAX(id) FROM "user"));
            SELECT setval(pg_get_serial_sequence('exercise_category', 'id'), (SELECT MAX(id) FROM "exercise_category"));
            SELECT setval(pg_get_serial_sequence('exercise', 'id'), (SELECT MAX(id) FROM "exercise"));
            SELECT setval(pg_get_serial_sequence('workout_session_plan', 'id'), (SELECT MAX(id) FROM "workout_session_plan"));
            SELECT setval(pg_get_serial_sequence('training_split', 'id'), (SELECT MAX(id) FROM "training_split"));
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete in reverse order to respect foreign key constraints
        await queryRunner.query(`DELETE FROM "training_split_day" WHERE training_split_id BETWEEN 1 AND 10;`);
        await queryRunner.query(`DELETE FROM "training_split" WHERE id BETWEEN 1 AND 10;`);

        await queryRunner.query(`DELETE FROM "workout_session_plan_exercise" WHERE workout_session_plan_id BETWEEN 1 AND 10;`);
        await queryRunner.query(`DELETE FROM "workout_session_plan" WHERE id BETWEEN 1 AND 10;`);

        await queryRunner.query(`DELETE FROM "exercise" WHERE id BETWEEN 1 AND 10;`);
        await queryRunner.query(`DELETE FROM "exercise_category" WHERE id BETWEEN 1 AND 5;`);

        await queryRunner.query(`DELETE FROM "user_roles" WHERE user_id IN (2, 3);`);
        await queryRunner.query(`DELETE FROM "user" WHERE id IN (2, 3);`);
    }
}
