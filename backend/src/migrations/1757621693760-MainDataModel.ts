import { MigrationInterface, QueryRunner } from 'typeorm';

export class MainDataModel1757621693760 implements MigrationInterface {
    name = 'MainDataModel1757621693760';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "exercise_category" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "description" text, CONSTRAINT "PK_977a54be5b15644bf5dc22093d5" PRIMARY KEY ("id")); COMMENT ON COLUMN "exercise_category"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "exercise_category"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "exercise_category"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "exercise_category"."name" IS 'Name of the exercise category'; COMMENT ON COLUMN "exercise_category"."description" IS 'Description of the exercise category'`,
        );
        await queryRunner.query(
            `CREATE TABLE "workout_session_exercise" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "order" integer NOT NULL, "actual_reps_per_set" json NOT NULL, "actual_weight_per_set" json NOT NULL, "notes" text, "workout_session_id" integer, "exercise_id" integer, CONSTRAINT "PK_b1ee0132818df1bdd505bfc1fe8" PRIMARY KEY ("id")); COMMENT ON COLUMN "workout_session_exercise"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "workout_session_exercise"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "workout_session_exercise"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "workout_session_exercise"."order" IS 'Order of the exercise in the workout session'; COMMENT ON COLUMN "workout_session_exercise"."actual_reps_per_set" IS 'Actual reps performed per set'; COMMENT ON COLUMN "workout_session_exercise"."actual_weight_per_set" IS 'Actual weight lifted per set'`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."exercise_body_part_enum" AS ENUM('Chest', 'Traps', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Core', 'Full Body')`,
        );
        await queryRunner.query(
            `CREATE TABLE "exercise" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "body_part" "public"."exercise_body_part_enum" NOT NULL, "equipment" character varying, "description" text, "image_url" character varying, "is_public" boolean NOT NULL DEFAULT false, "is_approved" boolean NOT NULL DEFAULT false, "created_by" integer, "category_id" integer, CONSTRAINT "PK_a0f107e3a2ef2742c1e91d97c14" PRIMARY KEY ("id")); COMMENT ON COLUMN "exercise"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "exercise"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "exercise"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "exercise"."name" IS 'Name of the exercise'; COMMENT ON COLUMN "exercise"."body_part" IS 'Primary body part targeted by the exercise'; COMMENT ON COLUMN "exercise"."equipment" IS 'Equipment needed for the exercise'; COMMENT ON COLUMN "exercise"."description" IS 'Description of how to perform the exercise'; COMMENT ON COLUMN "exercise"."image_url" IS 'URL to an image demonstrating the exercise'; COMMENT ON COLUMN "exercise"."is_public" IS 'Whether the exercise is public (user wants to share it)'; COMMENT ON COLUMN "exercise"."is_approved" IS 'Whether the exercise is approved (visible to all users)'`,
        );
        await queryRunner.query(
            `CREATE TABLE "workout_session_plan_exercise" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "order" integer NOT NULL, "planned_sets" integer NOT NULL, "planned_reps_per_set" json NOT NULL, "workout_session_plan_id" integer, "exercise_id" integer, CONSTRAINT "PK_9b994701bafed764687e3eea53c" PRIMARY KEY ("id")); COMMENT ON COLUMN "workout_session_plan_exercise"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "workout_session_plan_exercise"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "workout_session_plan_exercise"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "workout_session_plan_exercise"."order" IS 'Order of the exercise in the workout session plan'; COMMENT ON COLUMN "workout_session_plan_exercise"."planned_sets" IS 'Number of sets planned for the exercise'; COMMENT ON COLUMN "workout_session_plan_exercise"."planned_reps_per_set" IS 'Number of reps planned for each set'`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."training_split_assignment_status_enum" AS ENUM('pending', 'accepted', 'declined', 'active')`,
        );
        await queryRunner.query(
            `CREATE TABLE "training_split_assignment" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "status" "public"."training_split_assignment_status_enum" NOT NULL, "assigned_at" TIMESTAMP NOT NULL, "responded_at" TIMESTAMP, "trainee_id" integer, "training_split_id" integer, "assigned_by" integer, CONSTRAINT "PK_c26ef150b07094f581e3e3e6e4c" PRIMARY KEY ("id")); COMMENT ON COLUMN "training_split_assignment"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "training_split_assignment"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "training_split_assignment"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "training_split_assignment"."assigned_at" IS 'Timestamp when the training split was assigned'; COMMENT ON COLUMN "training_split_assignment"."responded_at" IS 'Timestamp when the trainee responded to the assignment (accepted/declined)'`,
        );
        await queryRunner.query(
            `CREATE TABLE "training_split" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "name" text NOT NULL, "description" text, "is_public" boolean NOT NULL DEFAULT false, "is_approved" boolean NOT NULL DEFAULT false, "created_by" integer, CONSTRAINT "PK_20319b97ffbc6cfbe9e97d9353f" PRIMARY KEY ("id")); COMMENT ON COLUMN "training_split"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "training_split"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "training_split"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "training_split"."name" IS 'Name of the training split'; COMMENT ON COLUMN "training_split"."description" IS 'Description of the training split'; COMMENT ON COLUMN "training_split"."is_public" IS 'Whether the training split is public'; COMMENT ON COLUMN "training_split"."is_approved" IS 'Whether the training split is approved'`,
        );
        await queryRunner.query(
            `CREATE TABLE "training_split_day" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "day_of_week" integer NOT NULL, "order" integer, "training_split_id" integer, "workout_session_plan_id" integer, CONSTRAINT "PK_571e5f2ee24a23e699393912752" PRIMARY KEY ("id")); COMMENT ON COLUMN "training_split_day"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "training_split_day"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "training_split_day"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "training_split_day"."day_of_week" IS 'Day of the week for this training split day (1=Monday, 7=Sunday)'; COMMENT ON COLUMN "training_split_day"."order" IS 'Order of the workout session plan in the day, if multiple plans are assigned to the same day'`,
        );
        await queryRunner.query(
            `CREATE TABLE "workout_session_plan" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "description" text, "is_public" boolean NOT NULL DEFAULT false, "is_approved" boolean NOT NULL DEFAULT false, "created_by" integer, CONSTRAINT "PK_16ab8cc2dcc4e81dcc34f970c7c" PRIMARY KEY ("id")); COMMENT ON COLUMN "workout_session_plan"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "workout_session_plan"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "workout_session_plan"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "workout_session_plan"."name" IS 'Name of the workout session plan'; COMMENT ON COLUMN "workout_session_plan"."description" IS 'Description of the workout session plan'; COMMENT ON COLUMN "workout_session_plan"."is_public" IS 'Indicates if the workout session plan is public'; COMMENT ON COLUMN "workout_session_plan"."is_approved" IS 'Indicates if the workout session plan is approved by an admin'`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."workout_session_status_enum" AS ENUM('in_progress', 'completed')`,
        );
        await queryRunner.query(
            `CREATE TABLE "workout_session" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "performed_date" TIMESTAMP NOT NULL, "status" "public"."workout_session_status_enum" NOT NULL DEFAULT 'in_progress', "started_at" TIMESTAMP, "finished_at" TIMESTAMP, "notes" text, "duration_seconds" integer, "user_id" integer, "workout_session_plan_id" integer, "training_split_id" integer, CONSTRAINT "PK_9afb74a335d8e9fd266763779af" PRIMARY KEY ("id")); COMMENT ON COLUMN "workout_session"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "workout_session"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "workout_session"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "workout_session"."performed_date" IS 'Date when the workout session was performed'; COMMENT ON COLUMN "workout_session"."status" IS 'Status of the workout session'; COMMENT ON COLUMN "workout_session"."started_at" IS 'Timestamp when the workout session was started'; COMMENT ON COLUMN "workout_session"."finished_at" IS 'Timestamp when the workout session was finished'; COMMENT ON COLUMN "workout_session"."notes" IS 'Notes about the workout session'; COMMENT ON COLUMN "workout_session"."duration_seconds" IS 'Duration of the workout session in seconds'`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."trainer_trainee_status_enum" AS ENUM('active', 'pending', 'removed')`,
        );
        await queryRunner.query(
            `CREATE TABLE "trainer_trainee" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "status" "public"."trainer_trainee_status_enum" NOT NULL DEFAULT 'pending', "assigned_at" TIMESTAMP NOT NULL, "trainer_id" integer, "trainee_id" integer, CONSTRAINT "PK_9d8069c5339eb09c73d0aa9955f" PRIMARY KEY ("id")); COMMENT ON COLUMN "trainer_trainee"."created_at" IS 'Timestamp when the entry was created'; COMMENT ON COLUMN "trainer_trainee"."updated_at" IS 'Timestamp when the entry was last updated'; COMMENT ON COLUMN "trainer_trainee"."is_deleted" IS 'Indicates if the entry is deleted'; COMMENT ON COLUMN "trainer_trainee"."status" IS 'Status of the trainer-trainee relationship'; COMMENT ON COLUMN "trainer_trainee"."assigned_at" IS 'Timestamp when the trainer was assigned to the trainee'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_4fe284c0f7ff88cf0acc157d33b" FOREIGN KEY ("workout_session_id") REFERENCES "workout_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_88195c98c68f7576ddc42c69d7e" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD CONSTRAINT "FK_771ebb8e1484ce936d4a556f065" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD CONSTRAINT "FK_977a54be5b15644bf5dc22093d5" FOREIGN KEY ("category_id") REFERENCES "exercise_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_01a8d266bb698c4ccbf867b1ac0" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_851f148812c9131d7eb40a71570" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_7dc5c68fc91cde1d0702c7d2b9b" FOREIGN KEY ("trainee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_e4d48f5667778d4309ec48dc2c6" FOREIGN KEY ("training_split_id") REFERENCES "training_split"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_d075e6297b83e14991002d05875" FOREIGN KEY ("assigned_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD CONSTRAINT "FK_883b111847fb09104c6ed068a1d" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_dbed13b3e10636f529f5d96a1e7" FOREIGN KEY ("training_split_id") REFERENCES "training_split"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_807517bb183518d0ad235598a23" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD CONSTRAINT "FK_11b24624b6b2965db34f9888a34" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_866288d15678cd65a07fc9a0feb" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_c6f076f2686b1d3a7d8911f37a3" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_d92352e06f82955dcde2f292b5d" FOREIGN KEY ("training_split_id") REFERENCES "training_split"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "trainer_trainee" ADD CONSTRAINT "FK_37dec4d800da44d7b9b7de8a503" FOREIGN KEY ("trainer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "trainer_trainee" ADD CONSTRAINT "FK_4490687c822df98b548426816a3" FOREIGN KEY ("trainee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "trainer_trainee" DROP CONSTRAINT "FK_4490687c822df98b548426816a3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "trainer_trainee" DROP CONSTRAINT "FK_37dec4d800da44d7b9b7de8a503"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_d92352e06f82955dcde2f292b5d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_c6f076f2686b1d3a7d8911f37a3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_866288d15678cd65a07fc9a0feb"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP CONSTRAINT "FK_11b24624b6b2965db34f9888a34"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_807517bb183518d0ad235598a23"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_dbed13b3e10636f529f5d96a1e7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP CONSTRAINT "FK_883b111847fb09104c6ed068a1d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_d075e6297b83e14991002d05875"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_e4d48f5667778d4309ec48dc2c6"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_7dc5c68fc91cde1d0702c7d2b9b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_851f148812c9131d7eb40a71570"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_01a8d266bb698c4ccbf867b1ac0"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP CONSTRAINT "FK_977a54be5b15644bf5dc22093d5"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP CONSTRAINT "FK_771ebb8e1484ce936d4a556f065"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_88195c98c68f7576ddc42c69d7e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_4fe284c0f7ff88cf0acc157d33b"`,
        );
        await queryRunner.query(`DROP TABLE "trainer_trainee"`);
        await queryRunner.query(
            `DROP TYPE "public"."trainer_trainee_status_enum"`,
        );
        await queryRunner.query(`DROP TABLE "workout_session"`);
        await queryRunner.query(
            `DROP TYPE "public"."workout_session_status_enum"`,
        );
        await queryRunner.query(`DROP TABLE "workout_session_plan"`);
        await queryRunner.query(`DROP TABLE "training_split_day"`);
        await queryRunner.query(`DROP TABLE "training_split"`);
        await queryRunner.query(`DROP TABLE "training_split_assignment"`);
        await queryRunner.query(
            `DROP TYPE "public"."training_split_assignment_status_enum"`,
        );
        await queryRunner.query(`DROP TABLE "workout_session_plan_exercise"`);
        await queryRunner.query(`DROP TABLE "exercise"`);
        await queryRunner.query(`DROP TYPE "public"."exercise_body_part_enum"`);
        await queryRunner.query(`DROP TABLE "workout_session_exercise"`);
        await queryRunner.query(`DROP TABLE "exercise_category"`);
    }
}
