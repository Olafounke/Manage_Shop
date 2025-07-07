<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250628150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial migration for Store and Inventory entities';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE store (
            id SERIAL PRIMARY KEY,
            store_id VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            name_slug VARCHAR(255) DEFAULT NULL,
            address VARCHAR(500) NOT NULL,
            longitude DECIMAL(10,8) DEFAULT NULL,
            latitude DECIMAL(10,8) DEFAULT NULL,
            user_id VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        )');

        $this->addSql('CREATE TABLE inventory (
            id SERIAL PRIMARY KEY,
            product_id VARCHAR(255) NOT NULL,
            product_name VARCHAR(255) DEFAULT NULL,
            quantity INTEGER NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
        )');

        // Create indexes for better performance
        $this->addSql('CREATE INDEX IDX_store_store_id ON store (store_id)');
        $this->addSql('CREATE INDEX IDX_inventory_product_id ON inventory (product_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE inventory');
        $this->addSql('DROP TABLE store');
    }
} 