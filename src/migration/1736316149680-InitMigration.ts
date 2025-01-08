import { type MigrationInterface, type QueryRunner } from "typeorm";

export class InitMigration1736316149680 implements MigrationInterface {
    name = 'InitMigration1736316149680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "application" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloApplicationId" character varying NOT NULL, "alloProfileId" character varying NOT NULL, "poolId" integer NOT NULL, CONSTRAINT "UQ_8849159f2a2681f6be67ef84efb" UNIQUE ("alloApplicationId", "poolId"), CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."metric_priority_enum" AS ENUM('ascending', 'descending')`);
        await queryRunner.query(`CREATE TABLE "metric" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "priority" "public"."metric_priority_enum" NOT NULL, "enabled" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_54e5ac9404e6102f0c661a5bf06" UNIQUE ("name"), CONSTRAINT "PK_7d24c075ea2926dd32bd1c534ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pool" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, CONSTRAINT "UQ_72fcaa655b2b7348f4feaf25ea3" UNIQUE ("chainId", "alloPoolId"), CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" SERIAL NOT NULL, "voter" character varying(42) NOT NULL, "alloPoolId" integer NOT NULL, "chainId" integer NOT NULL, "ballot" text NOT NULL, "poolId" integer NOT NULL, CONSTRAINT "UQ_3940f20660f872bfe5386def7f1" UNIQUE ("poolId", "voter"), CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_to_metric_score" ("id" SERIAL NOT NULL, "identifier" character varying NOT NULL, "score" double precision NOT NULL, "latest" boolean NOT NULL DEFAULT true, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "metricId" integer, CONSTRAINT "PK_7b77b8518b2ba4d789e4285b2c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_86b9c0ae3057aa451170728b2bb" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_to_metric_score" ADD CONSTRAINT "FK_2237e80d6886b794c667b483a73" FOREIGN KEY ("metricId") REFERENCES "metric"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_to_metric_score" DROP CONSTRAINT "FK_2237e80d6886b794c667b483a73"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_86b9c0ae3057aa451170728b2bb"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`);
        await queryRunner.query(`DROP TABLE "application_to_metric_score"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`DROP TABLE "pool"`);
        await queryRunner.query(`DROP TABLE "metric"`);
        await queryRunner.query(`DROP TYPE "public"."metric_priority_enum"`);
        await queryRunner.query(`DROP TABLE "application"`);
    }

}
