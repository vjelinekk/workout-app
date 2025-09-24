import { MigrationInterface, QueryRunner } from 'typeorm';

export class NoUniqueFirstAndLastName1758714511162
    implements MigrationInterface
{
    name = 'NoUniqueFirstAndLastName1758714511162';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_7a4fd2a547828e5efe420e50d1c"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "UQ_6937e802be2946855a3ad0e6bef"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_6937e802be2946855a3ad0e6bef" UNIQUE ("last_name")`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "UQ_7a4fd2a547828e5efe420e50d1c" UNIQUE ("first_name")`,
        );
    }
}
