import { hashSync } from 'bcrypt';
import { configDotenv } from 'dotenv';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperAdmin1757356293402 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        configDotenv();
        const hashedPassword = hashSync(
            process.env.SUPERADMIN_PASSWORD || '',
            10,
        );

        await queryRunner.query(`
            INSERT INTO "user" (id, first_name, last_name, nickname, email, password, created_at, is_deleted)
            VALUES (1, 'Super', 'Admin', 'superadmin', 'superadmin@example.com', '${hashedPassword}', NOW(), false);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "user" WHERE id = 1;
        `);
    }
}
