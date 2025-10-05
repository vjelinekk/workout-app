import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovedPerformedDate1759683618254 implements MigrationInterface {
    name = 'RemovedPerformedDate1759683618254';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workout_session" DROP COLUMN "performed_date"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "workout_session" ADD "performed_date" TIMESTAMP NOT NULL`,
        );
    }
}
