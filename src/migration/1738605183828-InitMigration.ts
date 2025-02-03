import { type MigrationInterface, type QueryRunner } from "typeorm";

export class InitMigration1738605183828 implements MigrationInterface {
    name = 'InitMigration1738605183828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "application" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, "alloApplicationId" character varying NOT NULL, "poolId" integer, CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_32767cacf4bb8819b2c51e854e" ON "application" ("alloPoolId", "chainId", "alloApplicationId") `);
        await queryRunner.query(`CREATE TYPE "public"."eligibility_criteria_eligibilitytype_enum" AS ENUM('linear')`);
        await queryRunner.query(`CREATE TABLE "eligibility_criteria" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, "eligibilityType" "public"."eligibility_criteria_eligibilitytype_enum" NOT NULL, "data" json NOT NULL, CONSTRAINT "PK_231ea7a8a87bb6092eb3af1c5a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cab3614863337cf5dba521b9b8" ON "eligibility_criteria" ("chainId", "alloPoolId") `);
        await queryRunner.query(`CREATE TABLE "pool" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, "metricIdentifiers" text, "distributionData" text, "customDistributionData" text, "eligibilityCriteriaId" integer, CONSTRAINT "REL_bb4a5f9f4367c3de6ccaf665cc" UNIQUE ("eligibilityCriteriaId"), CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_72fcaa655b2b7348f4feaf25ea" ON "pool" ("chainId", "alloPoolId") `);
        await queryRunner.query(`CREATE TABLE "vote" ("id" SERIAL NOT NULL, "voter" character varying(42) NOT NULL, "alloPoolId" character varying NOT NULL, "chainId" integer NOT NULL, "ballot" text NOT NULL, "poolId" integer NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3940f20660f872bfe5386def7f1" UNIQUE ("poolId", "voter"), CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4f0abff01b2f41e22cf23a215a" ON "vote" ("alloPoolId", "chainId", "voter") `);
        await queryRunner.query(`CREATE TYPE "public"."metric_orientation_enum" AS ENUM('increase', 'decrease')`);
        await queryRunner.query(`CREATE TABLE "metric" ("id" SERIAL NOT NULL, "identifier" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "orientation" "public"."metric_orientation_enum" NOT NULL, "enabled" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_1136bb423acf02b4e7e5c909d0c" UNIQUE ("identifier"), CONSTRAINT "PK_7d24c075ea2926dd32bd1c534ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pool" ADD CONSTRAINT "FK_bb4a5f9f4367c3de6ccaf665cc2" FOREIGN KEY ("eligibilityCriteriaId") REFERENCES "eligibility_criteria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_86b9c0ae3057aa451170728b2bb" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_86b9c0ae3057aa451170728b2bb"`);
        await queryRunner.query(`ALTER TABLE "pool" DROP CONSTRAINT "FK_bb4a5f9f4367c3de6ccaf665cc2"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`);
        await queryRunner.query(`DROP TABLE "metric"`);
        await queryRunner.query(`DROP TYPE "public"."metric_orientation_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4f0abff01b2f41e22cf23a215a"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_72fcaa655b2b7348f4feaf25ea"`);
        await queryRunner.query(`DROP TABLE "pool"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cab3614863337cf5dba521b9b8"`);
        await queryRunner.query(`DROP TABLE "eligibility_criteria"`);
        await queryRunner.query(`DROP TYPE "public"."eligibility_criteria_eligibilitytype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32767cacf4bb8819b2c51e854e"`);
        await queryRunner.query(`DROP TABLE "application"`);
    }

}
