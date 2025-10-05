import { MigrationInterface, QueryRunner } from "typeorm";

export class WorkoutSessionAuditable1759672686380 implements MigrationInterface {
    name = 'WorkoutSessionAuditable1759672686380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" ADD "created_by_id" integer NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session_exercise"."created_by_id" IS 'User who created the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" ADD "updated_by_id" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session_exercise"."updated_by_id" IS 'User who updated the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" ADD "deleted_by_id" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session_exercise"."deleted_by_id" IS 'User who deleted the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session" ADD "created_by_id" integer NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session"."created_by_id" IS 'User who created the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session" ADD "updated_by_id" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session"."updated_by_id" IS 'User who updated the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session" ADD "deleted_by_id" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session"."deleted_by_id" IS 'User who deleted the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_efa7b606d918afdce37510bdfdf" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_a68b8ca71e59560660d82103389" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_1ad002f06e1d72164f3a925ac8e" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_session" ADD CONSTRAINT "FK_cd83439215b96a38f15c1565e8c" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_session" ADD CONSTRAINT "FK_2e3ade19a0f0f76b74495c8a04f" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_session" ADD CONSTRAINT "FK_d2459804fd770be36f46c7ccd16" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workout_session" DROP CONSTRAINT "FK_d2459804fd770be36f46c7ccd16"`);
        await queryRunner.query(`ALTER TABLE "workout_session" DROP CONSTRAINT "FK_2e3ade19a0f0f76b74495c8a04f"`);
        await queryRunner.query(`ALTER TABLE "workout_session" DROP CONSTRAINT "FK_cd83439215b96a38f15c1565e8c"`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_1ad002f06e1d72164f3a925ac8e"`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_a68b8ca71e59560660d82103389"`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_efa7b606d918afdce37510bdfdf"`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session"."deleted_by_id" IS 'User who deleted the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session" DROP COLUMN "deleted_by_id"`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session"."updated_by_id" IS 'User who updated the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session" DROP COLUMN "updated_by_id"`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session"."created_by_id" IS 'User who created the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session" DROP COLUMN "created_by_id"`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session_exercise"."deleted_by_id" IS 'User who deleted the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" DROP COLUMN "deleted_by_id"`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session_exercise"."updated_by_id" IS 'User who updated the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" DROP COLUMN "updated_by_id"`);
        await queryRunner.query(`COMMENT ON COLUMN "workout_session_exercise"."created_by_id" IS 'User who created the entry'`);
        await queryRunner.query(`ALTER TABLE "workout_session_exercise" DROP COLUMN "created_by_id"`);
    }

}
