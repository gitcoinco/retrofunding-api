import { type MigrationInterface, type QueryRunner } from "typeorm";

export class InitMigration1736569153513 implements MigrationInterface {
    name = 'InitMigration1736569153513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "application" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloApplicationId" character varying NOT NULL, "poolId" integer NOT NULL, CONSTRAINT "UQ_8849159f2a2681f6be67ef84efb" UNIQUE ("alloApplicationId", "poolId"), CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."metric_orientation_enum" AS ENUM('increase', 'decrease')`);
        await queryRunner.query(`CREATE TABLE "metric" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "orientation" "public"."metric_orientation_enum" NOT NULL, "enabled" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_54e5ac9404e6102f0c661a5bf06" UNIQUE ("name"), CONSTRAINT "PK_7d24c075ea2926dd32bd1c534ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."eligibility_criteria_eligibilitytype_enum" AS ENUM('linear')`);
        await queryRunner.query(`CREATE TABLE "eligibility_criteria" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, "eligibilityType" "public"."eligibility_criteria_eligibilitytype_enum" NOT NULL, "data" json NOT NULL, "poolId" integer NOT NULL, CONSTRAINT "UQ_6120ad406cc5a00db622f3b0c97" UNIQUE ("poolId"), CONSTRAINT "PK_231ea7a8a87bb6092eb3af1c5a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pool" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, CONSTRAINT "UQ_72fcaa655b2b7348f4feaf25ea3" UNIQUE ("chainId", "alloPoolId"), CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" SERIAL NOT NULL, "voter" character varying(42) NOT NULL, "alloPoolId" character varying NOT NULL, "chainId" integer NOT NULL, "ballot" text NOT NULL, "poolId" integer NOT NULL, CONSTRAINT "UQ_3940f20660f872bfe5386def7f1" UNIQUE ("poolId", "voter"), CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "distribution" ("id" SERIAL NOT NULL, "alloPoolId" character varying NOT NULL, "chainId" integer NOT NULL, "finalized" boolean NOT NULL DEFAULT false, "applicationData" text NOT NULL, "poolId" integer NOT NULL, CONSTRAINT "UQ_918746f57478f4839550fbeb937" UNIQUE ("poolId"), CONSTRAINT "PK_187eaf203ccf9018df51b40108c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_86b9c0ae3057aa451170728b2bb" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "distribution" ADD CONSTRAINT "FK_918746f57478f4839550fbeb937" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "distribution" DROP CONSTRAINT "FK_918746f57478f4839550fbeb937"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_86b9c0ae3057aa451170728b2bb"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`);
        await queryRunner.query(`DROP TABLE "distribution"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`DROP TABLE "pool"`);
        await queryRunner.query(`DROP TABLE "eligibility_criteria"`);
        await queryRunner.query(`DROP TYPE "public"."eligibility_criteria_eligibilitytype_enum"`);
        await queryRunner.query(`DROP TABLE "metric"`);
        await queryRunner.query(`DROP TYPE "public"."metric_orientation_enum"`);
        await queryRunner.query(`DROP TABLE "application"`);
    }

}
