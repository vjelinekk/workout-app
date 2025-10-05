import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPerformedBy1759683699610 implements MigrationInterface {
    name = 'DropPerformedBy1759683699610';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_8c06febbcb3f4e367b6b6334885"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ALTER COLUMN "performed_by_id" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_8c06febbcb3f4e367b6b6334885" FOREIGN KEY ("performed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP CONSTRAINT "FK_8c06febbcb3f4e367b6b6334885"`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ALTER COLUMN "performed_by_id" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD CONSTRAINT "FK_8c06febbcb3f4e367b6b6334885" FOREIGN KEY ("performed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
