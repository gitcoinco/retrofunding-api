import { type MigrationInterface, type QueryRunner } from "typeorm";

export class InitMigration1736252633606 implements MigrationInterface {
    name = 'InitMigration1736252633606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."metric_priority_enum" AS ENUM('ascending', 'descending')`);
        await queryRunner.query(`CREATE TABLE "metric" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "priority" "public"."metric_priority_enum" NOT NULL, "active" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_54e5ac9404e6102f0c661a5bf06" UNIQUE ("name"), CONSTRAINT "PK_7d24c075ea2926dd32bd1c534ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "allocation" ("id" SERIAL NOT NULL, "allocator" character varying(42) NOT NULL, "allocationPercentage" integer NOT NULL, "applicationId" integer NOT NULL, "metricId" integer NOT NULL, CONSTRAINT "UQ_3f25daa7d4bf7de81024cc2a406" UNIQUE ("allocator"), CONSTRAINT "PK_7df89c736595e454b6ae07264fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloApplicationId" character varying NOT NULL, "poolId" integer NOT NULL, CONSTRAINT "UQ_44dbcb26fba94fd04aaf46392fa" UNIQUE ("alloApplicationId", "poolId", "chainId"), CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pool" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "alloPoolId" character varying NOT NULL, CONSTRAINT "UQ_72fcaa655b2b7348f4feaf25ea3" UNIQUE ("chainId", "alloPoolId"), CONSTRAINT "PK_db1bfe411e1516c01120b85f8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_to_metric_score" ("id" SERIAL NOT NULL, "score" double precision NOT NULL, "applicationId" integer, "metricId" integer, CONSTRAINT "PK_7b77b8518b2ba4d789e4285b2c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "allocation" ADD CONSTRAINT "FK_f9d94c5eaf899f9c1f1f5277c22" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "allocation" ADD CONSTRAINT "FK_64d759511259cd107413d9db8f2" FOREIGN KEY ("metricId") REFERENCES "metric"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284" FOREIGN KEY ("poolId") REFERENCES "pool"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_to_metric_score" ADD CONSTRAINT "FK_fea9a44ecd9ca0222161671663b" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_to_metric_score" ADD CONSTRAINT "FK_2237e80d6886b794c667b483a73" FOREIGN KEY ("metricId") REFERENCES "metric"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_to_metric_score" DROP CONSTRAINT "FK_2237e80d6886b794c667b483a73"`);
        await queryRunner.query(`ALTER TABLE "application_to_metric_score" DROP CONSTRAINT "FK_fea9a44ecd9ca0222161671663b"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_a2d1c7a2c6ee681b42112d41284"`);
        await queryRunner.query(`ALTER TABLE "allocation" DROP CONSTRAINT "FK_64d759511259cd107413d9db8f2"`);
        await queryRunner.query(`ALTER TABLE "allocation" DROP CONSTRAINT "FK_f9d94c5eaf899f9c1f1f5277c22"`);
        await queryRunner.query(`DROP TABLE "application_to_metric_score"`);
        await queryRunner.query(`DROP TABLE "pool"`);
        await queryRunner.query(`DROP TABLE "application"`);
        await queryRunner.query(`DROP TABLE "allocation"`);
        await queryRunner.query(`DROP TABLE "metric"`);
        await queryRunner.query(`DROP TYPE "public"."metric_priority_enum"`);
    }

}
