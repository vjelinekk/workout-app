import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateComments1757526908573 implements MigrationInterface {
    name = 'UpdateComments1757526908573';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "role"."created_at" IS 'Timestamp when the entry was created'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "role"."updated_at" IS 'Timestamp when the entry was last updated'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "role"."is_deleted" IS 'Indicates if the entry is deleted'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "user"."created_at" IS 'Timestamp when the entry was created'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "user"."updated_at" IS 'Timestamp when the entry was last updated'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "user"."is_deleted" IS 'Indicates if the entry is deleted'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `COMMENT ON COLUMN "user"."is_deleted" IS 'Indicates if the user is deleted'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "user"."updated_at" IS 'Timestamp when the user was last updated'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "user"."created_at" IS 'Timestamp when the user was created'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "role"."is_deleted" IS 'Indicates if the role is deleted'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "role"."updated_at" IS 'Timestamp when the role was last updated'`,
        );
        await queryRunner.query(
            `COMMENT ON COLUMN "role"."created_at" IS 'Timestamp when the role was created'`,
        );
    }
}
