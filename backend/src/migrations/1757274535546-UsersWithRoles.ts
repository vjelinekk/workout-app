import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersWithRoles1757274535546 implements MigrationInterface {
    name = 'UsersWithRoles1757274535546';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "created_by" integer, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")); COMMENT ON COLUMN "role"."name" IS 'Role name, e.g., admin, user, etc.'; COMMENT ON COLUMN "role"."description" IS 'Description of the role'; COMMENT ON COLUMN "role"."created_at" IS 'Timestamp when the role was created'; COMMENT ON COLUMN "role"."updated_at" IS 'Timestamp when the role was last updated'; COMMENT ON COLUMN "role"."is_deleted" IS 'Indicates if the role is deleted'`,
        );
        await queryRunner.query(
            `CREATE TABLE "user" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "nickname" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_7a4fd2a547828e5efe420e50d1c" UNIQUE ("first_name"), CONSTRAINT "UQ_6937e802be2946855a3ad0e6bef" UNIQUE ("last_name"), CONSTRAINT "UQ_e2364281027b926b879fa2fa1e0" UNIQUE ("nickname"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")); COMMENT ON COLUMN "user"."first_name" IS 'First name of the user'; COMMENT ON COLUMN "user"."last_name" IS 'Last name of the user'; COMMENT ON COLUMN "user"."nickname" IS 'Nickname of the user'; COMMENT ON COLUMN "user"."email" IS 'Email address of the user'; COMMENT ON COLUMN "user"."password" IS 'Hashed password of the user'; COMMENT ON COLUMN "user"."created_at" IS 'Timestamp when the user was created'; COMMENT ON COLUMN "user"."updated_at" IS 'Timestamp when the user was last updated'; COMMENT ON COLUMN "user"."is_deleted" IS 'Indicates if the user is deleted'`,
        );
        await queryRunner.query(
            `CREATE TABLE "user_roles" ("user_id" integer NOT NULL, "role_id" integer NOT NULL, CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `,
        );
        await queryRunner.query(
            `ALTER TABLE "role" ADD CONSTRAINT "FK_04a09925beea59e864e921db4a1" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
        );
        await queryRunner.query(
            `ALTER TABLE "role" DROP CONSTRAINT "FK_04a09925beea59e864e921db4a1"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`,
        );
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }
}
