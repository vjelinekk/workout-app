import { MigrationInterface, QueryRunner } from 'typeorm';

export class DefaultRoles1757357313588 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "role" (id, name, description, created_at, is_deleted, created_by)
            VALUES 
                (1, 'admin', 'Administrator with all permissions', NOW(), false, 1),
                (2, 'trainee', 'User that cannot train other users', NOW(), false, 1),
                (3, 'trainer', 'User that can train other users', NOW(), false, 1);

            INSERT INTO "user_roles" (user_id, role_id)
            VALUES 
                (1, 1); -- Assign 'admin' role to the superadmin user
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "user_roles" WHERE user_id = 1 AND role_id = 1;
            DELETE FROM "role" WHERE id IN (1, 2, 3);
        `);
    }
}
