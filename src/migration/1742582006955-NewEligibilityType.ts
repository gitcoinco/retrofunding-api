import { type MigrationInterface, type QueryRunner } from "typeorm";

export class NewEligibilityType1742582006955 implements MigrationInterface {
    name = 'NewEligibilityType1742582006955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."eligibility_criteria_eligibilitytype_enum" RENAME TO "eligibility_criteria_eligibilitytype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."eligibility_criteria_eligibilitytype_enum" AS ENUM('linear', 'weighted')`);
        await queryRunner.query(`ALTER TABLE "eligibility_criteria" ALTER COLUMN "eligibilityType" TYPE "public"."eligibility_criteria_eligibilitytype_enum" USING "eligibilityType"::"text"::"public"."eligibility_criteria_eligibilitytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."eligibility_criteria_eligibilitytype_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."eligibility_criteria_eligibilitytype_enum_old" AS ENUM('linear')`);
        await queryRunner.query(`ALTER TABLE "eligibility_criteria" ALTER COLUMN "eligibilityType" TYPE "public"."eligibility_criteria_eligibilitytype_enum_old" USING "eligibilityType"::"text"::"public"."eligibility_criteria_eligibilitytype_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."eligibility_criteria_eligibilitytype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."eligibility_criteria_eligibilitytype_enum_old" RENAME TO "eligibility_criteria_eligibilitytype_enum"`);
    }

}
