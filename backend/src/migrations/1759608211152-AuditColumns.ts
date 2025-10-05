import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditColumns1759608211152 implements MigrationInterface {
    name = 'AuditColumns1759608211152';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP CONSTRAINT "FK_771ebb8e1484ce936d4a556f065"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP CONSTRAINT "FK_11b24624b6b2965db34f9888a34"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP COLUMN "created_by"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP COLUMN "created_by"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" ADD "created_by_id" integer NOT NULL`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise_category"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" ADD "updated_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise_category"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" ADD "deleted_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise_category"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD "created_by_id" integer NOT NULL`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD "updated_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD "deleted_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD "created_by_id" integer NOT NULL`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan_exercise"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD "updated_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan_exercise"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD "deleted_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan_exercise"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD "created_by_id" integer NOT NULL`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD "updated_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD "deleted_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_01a8d266bb698c4ccbf867b1ac0"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_851f148812c9131d7eb40a71570"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ALTER COLUMN "workout_session_plan_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ALTER COLUMN "exercise_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" ADD CONSTRAINT "FK_d99dee4914af953332b309b6162" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" ADD CONSTRAINT "FK_b8fbb60622f544509b1da51f42c" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" ADD CONSTRAINT "FK_f2cc22541a1cd00556d417c38a6" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD CONSTRAINT "FK_5092c2da9c63316f41684176a7a" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD CONSTRAINT "FK_4c76e8f0033d497eebb2b2dac3b" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD CONSTRAINT "FK_7fe959d56b6f84b7d0137d0b79e" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_e682e2f286c185332b6b136d45f" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_cbeeecc96e0722679463fab0db3" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_bdfa6831816e41f36d57797631c" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_01a8d266bb698c4ccbf867b1ac0" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_851f148812c9131d7eb40a71570" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD CONSTRAINT "FK_fb5bbe1ffcda467f4200788e2f3" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD CONSTRAINT "FK_bc01516584f93dae70bff213d1c" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD CONSTRAINT "FK_32782e4148cbf4405a175948f68" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP CONSTRAINT "FK_32782e4148cbf4405a175948f68"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP CONSTRAINT "FK_bc01516584f93dae70bff213d1c"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP CONSTRAINT "FK_fb5bbe1ffcda467f4200788e2f3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_851f148812c9131d7eb40a71570"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_01a8d266bb698c4ccbf867b1ac0"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_bdfa6831816e41f36d57797631c"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_cbeeecc96e0722679463fab0db3"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP CONSTRAINT "FK_e682e2f286c185332b6b136d45f"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP CONSTRAINT "FK_7fe959d56b6f84b7d0137d0b79e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP CONSTRAINT "FK_4c76e8f0033d497eebb2b2dac3b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP CONSTRAINT "FK_5092c2da9c63316f41684176a7a"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" DROP CONSTRAINT "FK_f2cc22541a1cd00556d417c38a6"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" DROP CONSTRAINT "FK_b8fbb60622f544509b1da51f42c"`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" DROP CONSTRAINT "FK_d99dee4914af953332b309b6162"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ALTER COLUMN "exercise_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ALTER COLUMN "workout_session_plan_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_851f148812c9131d7eb40a71570" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" ADD CONSTRAINT "FK_01a8d266bb698c4ccbf867b1ac0" FOREIGN KEY ("workout_session_plan_id") REFERENCES "workout_session_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP COLUMN "deleted_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP COLUMN "updated_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" DROP COLUMN "created_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan_exercise"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP COLUMN "deleted_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan_exercise"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP COLUMN "updated_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "workout_session_plan_exercise"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan_exercise" DROP COLUMN "created_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP COLUMN "deleted_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP COLUMN "updated_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" DROP COLUMN "created_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise_category"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" DROP COLUMN "deleted_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise_category"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" DROP COLUMN "updated_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "exercise_category"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise_category" DROP COLUMN "created_by_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD "created_by" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD "created_by" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session_plan" ADD CONSTRAINT "FK_11b24624b6b2965db34f9888a34" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "exercise" ADD CONSTRAINT "FK_771ebb8e1484ce936d4a556f065" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
