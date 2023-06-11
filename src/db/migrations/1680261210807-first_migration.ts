import { MigrationInterface, QueryRunner } from 'typeorm';

export class firstMigration1680261210807 implements MigrationInterface {
  name = 'firstMigration1680261210807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "service_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "updated_by" character varying, "deleted_by" character varying, "is_deleted" boolean, "name" character varying NOT NULL, "category" character varying NOT NULL, "parent_id" character varying, "min_service_fee" integer NOT NULL DEFAULT '3000', "is_parent_only" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_0a11a8d444eff1346826caed987" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "updated_by" character varying, "deleted_by" character varying, "is_deleted" boolean, "description" character varying NOT NULL, "start_add" character varying, "start_state" character varying, "start_city" character varying, "end_add" character varying, "end_state" character varying, "end_city" character varying, "start_date" TIMESTAMP, "end_date" TIMESTAMP, "status" character varying, "amount" integer, "createdById" uuid, CONSTRAINT "PK_08446fa58294cb2dd0b6ff9e5a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_request_proposal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "updated_by" character varying, "deleted_by" character varying, "is_deleted" boolean, "invite_date" TIMESTAMP NOT NULL DEFAULT now(), "invite_accept_date" TIMESTAMP, "invite_decline_date" TIMESTAMP, "invite_cancel_date" TIMESTAMP, "invite_cancel_reason" character varying, "amount" integer, "status" character varying NOT NULL DEFAULT 'INVITED', "proposal_sent_date" TIMESTAMP, "proposal_accept_date" TIMESTAMP, "proposal_amount" integer, "amount_paid" integer, "amount_paid_date" TIMESTAMP, "dispute_date" character varying, "dispute_resolve_date" TIMESTAMP, "dispute_reason" character varying, "job_complete_date" TIMESTAMP, "job_complete_note" TIMESTAMP, "job_complete_file_1" character varying, "job_complete_file_2" character varying, "job_complete_file_3" character varying, "job_complete_file_4" character varying, "job_complete_file_5" character varying, "job_complete_file_6" character varying, "serviceRequestId" uuid, "serviceProviderId" uuid, CONSTRAINT "PK_91abc30c0ac1e76916cb4f4a99c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "updated_by" character varying, "deleted_by" character varying, "is_deleted" boolean, "description" character varying NOT NULL, "amount" integer NOT NULL, "curr_code" character varying DEFAULT 'NGN', "bal_after" integer NOT NULL, "tnx_type" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "is_deleted" boolean, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "is_admin" boolean, "is_client" boolean, "is_sp" boolean, "gender" character varying, "phone_number" bigint, "is_phone_verified" boolean, "bio" character varying, "avai_status" character varying, "is_verified" boolean DEFAULT false, "verified_at" TIMESTAMP, "loc_state" character varying, "loc_country" character varying, "loc_geo" character varying, "loc_add" character varying, "loc_postcode" character varying, "loc_land_mark" character varying, "loc_street" character varying, "loc_city" character varying, "loc_lga" character varying, "loc_town" character varying, "loc_region" character varying, "photo_uri" character varying, "ver_doc" character varying, "amount_per_hour" integer, "trnx_pin" character varying, "wallet_balance" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_01eea41349b6c9275aec646eee0" UNIQUE ("phone_number"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "updated_by" character varying, "deleted_by" character varying, "is_deleted" boolean, "bank_name" character varying NOT NULL, "account_number" integer NOT NULL, "account_name" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_f3246deb6b79123482c6adb9745" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "funding_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, "updated_by" character varying, "deleted_by" character varying, "is_deleted" boolean, "amount" integer NOT NULL, "ref_no" character varying NOT NULL, "bank_name" character varying NOT NULL, "payment_method" character varying NOT NULL, CONSTRAINT "PK_bdc274a1d703a3fd14c241de158" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "is_read" boolean NOT NULL DEFAULT false, "message" character varying NOT NULL, "subject" character varying NOT NULL, "user_id" character varying NOT NULL, "target" character varying NOT NULL, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rating" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "star" integer NOT NULL, "review" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ecda8ad32645327e4765b43649e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE " verification_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "type" character varying DEFAULT 'VERIFY_EMAIL', "identifier" character varying NOT NULL, "iden_type" character varying NOT NULL DEFAULT 'EMAIL', "is_used" boolean NOT NULL DEFAULT false, "expiry_at" TIMESTAMP NOT NULL, "used_at" TIMESTAMP, "user_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bab8b88074af7d8470b58d27d54" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_request_service_types_service_type" ("serviceRequestId" uuid NOT NULL, "serviceTypeId" uuid NOT NULL, CONSTRAINT "PK_13331dbe801bfb376c9c4be8cf8" PRIMARY KEY ("serviceRequestId", "serviceTypeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_709f744121e816535c53c4109c" ON "service_request_service_types_service_type" ("serviceRequestId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8ce2dff9bc1cefec77ab4f833" ON "service_request_service_types_service_type" ("serviceTypeId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_service_types_service_type" ("userId" uuid NOT NULL, "serviceTypeId" uuid NOT NULL, CONSTRAINT "PK_e1a7023f87993e4bc5b2d242259" PRIMARY KEY ("userId", "serviceTypeId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc5e9ef8008e6f0dcd5d03b04e" ON "user_service_types_service_type" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac67742ddd0a29dc764d133bf0" ON "user_service_types_service_type" ("serviceTypeId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request" ADD CONSTRAINT "FK_323e1d751ad6d23eb0c617d1735" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request_proposal" ADD CONSTRAINT "FK_900361a6e55ac58d6c90dad124e" FOREIGN KEY ("serviceRequestId") REFERENCES "service_request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request_proposal" ADD CONSTRAINT "FK_cd8929efc071d840848efd5cd21" FOREIGN KEY ("serviceProviderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_account" ADD CONSTRAINT "FK_c2ba1381682b0291238cbc7a65d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request_service_types_service_type" ADD CONSTRAINT "FK_709f744121e816535c53c4109c2" FOREIGN KEY ("serviceRequestId") REFERENCES "service_request"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request_service_types_service_type" ADD CONSTRAINT "FK_b8ce2dff9bc1cefec77ab4f8334" FOREIGN KEY ("serviceTypeId") REFERENCES "service_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service_types_service_type" ADD CONSTRAINT "FK_dc5e9ef8008e6f0dcd5d03b04e6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service_types_service_type" ADD CONSTRAINT "FK_ac67742ddd0a29dc764d133bf09" FOREIGN KEY ("serviceTypeId") REFERENCES "service_type"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_service_types_service_type" DROP CONSTRAINT "FK_ac67742ddd0a29dc764d133bf09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_service_types_service_type" DROP CONSTRAINT "FK_dc5e9ef8008e6f0dcd5d03b04e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request_service_types_service_type" DROP CONSTRAINT "FK_b8ce2dff9bc1cefec77ab4f8334"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request_service_types_service_type" DROP CONSTRAINT "FK_709f744121e816535c53c4109c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bank_account" DROP CONSTRAINT "FK_c2ba1381682b0291238cbc7a65d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request_proposal" DROP CONSTRAINT "FK_cd8929efc071d840848efd5cd21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request_proposal" DROP CONSTRAINT "FK_900361a6e55ac58d6c90dad124e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_request" DROP CONSTRAINT "FK_323e1d751ad6d23eb0c617d1735"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac67742ddd0a29dc764d133bf0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc5e9ef8008e6f0dcd5d03b04e"`,
    );
    await queryRunner.query(`DROP TABLE "user_service_types_service_type"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8ce2dff9bc1cefec77ab4f833"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_709f744121e816535c53c4109c"`,
    );
    await queryRunner.query(
      `DROP TABLE "service_request_service_types_service_type"`,
    );
    await queryRunner.query(`DROP TABLE " verification_code"`);
    await queryRunner.query(`DROP TABLE "rating"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "funding_entity"`);
    await queryRunner.query(`DROP TABLE "bank_account"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "service_request_proposal"`);
    await queryRunner.query(`DROP TABLE "service_request"`);
    await queryRunner.query(`DROP TABLE "service_type"`);
  }
}
