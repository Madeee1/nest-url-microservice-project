import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpirationDateToV1Url1730207150785
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add expiresAt and createdAt columns to v1_url table
    await queryRunner.query(
      `ALTER TABLE v1_url ADD COLUMN expires_at DATETIME`,
    );
    await queryRunner.query(
      `ALTER TABLE v1_url ADD COLUMN created_at DATETIME`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop expiresAt and createdAt columns from v1_url table
    await queryRunner.query(`ALTER TABLE v1_url DROP COLUMN expires_at`);
    await queryRunner.query(`ALTER TABLE v1_url DROP COLUMN created_at`);
  }
}
