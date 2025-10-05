import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrainingAuditColumns1759675361491 implements MigrationInterface {
    name = 'TrainingAuditColumns1759675361491';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP CONSTRAINT "FK_883b111847fb09104c6ed068a1d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP COLUMN "created_by"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD "created_by_id" integer NOT NULL`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_assignment"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD "updated_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_assignment"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD "deleted_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_assignment"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD "created_by_id" integer NOT NULL`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD "updated_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD "deleted_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD "created_by_id" integer NOT NULL`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_day"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD "updated_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_day"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD "deleted_by_id" integer`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_day"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_c7d7e398ca9b26304feb66480dd" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_bf6bfd9212869a52428888bd9bc" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" ADD CONSTRAINT "FK_f6859aa58d89ec013a4f9b13c08" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD CONSTRAINT "FK_e07dab5c5d4f6ccfbdba086e7bc" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD CONSTRAINT "FK_f6ac065751491651711115d6c79" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD CONSTRAINT "FK_fc30588913cb37e420b29b5145b" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_26e7e87c742086614e54b8e1130" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_c21321250270a2de3dc0baec47c" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" ADD CONSTRAINT "FK_72b717c061166ff76a66b11768e" FOREIGN KEY ("deleted_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_72b717c061166ff76a66b11768e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_c21321250270a2de3dc0baec47c"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP CONSTRAINT "FK_26e7e87c742086614e54b8e1130"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP CONSTRAINT "FK_fc30588913cb37e420b29b5145b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP CONSTRAINT "FK_f6ac065751491651711115d6c79"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP CONSTRAINT "FK_e07dab5c5d4f6ccfbdba086e7bc"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_f6859aa58d89ec013a4f9b13c08"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_bf6bfd9212869a52428888bd9bc"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP CONSTRAINT "FK_c7d7e398ca9b26304feb66480dd"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_day"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP COLUMN "deleted_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_day"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP COLUMN "updated_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_day"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_day" DROP COLUMN "created_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP COLUMN "deleted_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP COLUMN "updated_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" DROP COLUMN "created_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_assignment"."deleted_by_id" IS 'User who deleted the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP COLUMN "deleted_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_assignment"."updated_by_id" IS 'User who updated the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP COLUMN "updated_by_id"`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "training_split_assignment"."created_by_id" IS 'User who created the entry'`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split_assignment" DROP COLUMN "created_by_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD "created_by" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE "training_split" ADD CONSTRAINT "FK_883b111847fb09104c6ed068a1d" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
