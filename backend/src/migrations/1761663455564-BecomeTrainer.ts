import { MigrationInterface, QueryRunner } from 'typeorm';

export class BecomeTrainer1761663455564 implements MigrationInterface {
    name = 'BecomeTrainer1761663455564';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "want_to_become_trainer" boolean NOT NULL DEFAULT false`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD "become_trainer_reason" text`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_4fe284c0f7ff88cf0acc157d33b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_88195c98c68f7576ddc42c69d7e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ALTER COLUMN "workout_session_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ALTER COLUMN "exercise_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_4fe284c0f7ff88cf0acc157d33b" FOREIGN KEY ("workout_session_id") REFERENCES "workout_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_88195c98c68f7576ddc42c69d7e" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_88195c98c68f7576ddc42c69d7e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" DROP CONSTRAINT "FK_4fe284c0f7ff88cf0acc157d33b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ALTER COLUMN "exercise_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ALTER COLUMN "workout_session_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_88195c98c68f7576ddc42c69d7e" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_exercise" ADD CONSTRAINT "FK_4fe284c0f7ff88cf0acc157d33b" FOREIGN KEY ("workout_session_id") REFERENCES "workout_session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "become_trainer_reason"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "want_to_become_trainer"`,
        );
    }
}
