import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkoutSessionColumnRename1759681497626
    implements MigrationInterface
{
    name = 'WorkoutSessionColumnRename1759681497626';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_866288d15678cd65a07fc9a0feb"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP COLUMN "user_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD "performed_by_id" integer NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_7dc5c68fc91cde1d0702c7d2b9b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_e4d48f5667778d4309ec48dc2c6"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ALTER COLUMN "trainee_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ALTER COLUMN "training_split_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_dbed13b3e10636f529f5d96a1e7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_807517bb183518d0ad235598a23"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ALTER COLUMN "training_split_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ALTER COLUMN "workout_session_plan_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_c6f076f2686b1d3a7d8911f37a3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ALTER COLUMN "workout_session_plan_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_7dc5c68fc91cde1d0702c7d2b9b" FOREIGN KEY ("trainee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_e4d48f5667778d4309ec48dc2c6" FOREIGN KEY ("training_split_id") REFERENCES "training_split"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_dbed13b3e10636f529f5d96a1e7" FOREIGN KEY ("training_split_id") REFERENCES "training_split"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_807517bb183518d0ad235598a23" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_8c06febbcb3f4e367b6b6334885" FOREIGN KEY ("performed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_c6f076f2686b1d3a7d8911f37a3" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_c6f076f2686b1d3a7d8911f37a3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_8c06febbcb3f4e367b6b6334885"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_807517bb183518d0ad235598a23"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_dbed13b3e10636f529f5d96a1e7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_e4d48f5667778d4309ec48dc2c6"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_7dc5c68fc91cde1d0702c7d2b9b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ALTER COLUMN "workout_session_plan_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_c6f076f2686b1d3a7d8911f37a3" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ALTER COLUMN "workout_session_plan_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ALTER COLUMN "training_split_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_807517bb183518d0ad235598a23" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_dbed13b3e10636f529f5d96a1e7" FOREIGN KEY ("training_split_id") REFERENCES "training_split"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ALTER COLUMN "training_split_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ALTER COLUMN "trainee_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_e4d48f5667778d4309ec48dc2c6" FOREIGN KEY ("training_split_id") REFERENCES "training_split"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_7dc5c68fc91cde1d0702c7d2b9b" FOREIGN KEY ("trainee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP COLUMN "performed_by_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD "user_id" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_866288d15678cd65a07fc9a0feb" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
