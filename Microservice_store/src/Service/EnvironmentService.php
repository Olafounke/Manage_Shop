<?php

namespace App\Service;

class EnvironmentService
{
    public function getStoreId(): string
    {
        return $_ENV['STORE_ID'] ?? '';
    }

    public function getStoreName(): string
    {
        return $_ENV['STORE_NAME'] ?? '';
    }

    public function getStoreAddress(): string
    {
        return $_ENV['STORE_ADDRESS'] ?? '';
    }

    public function getUserId(): ?string
    {
        return $_ENV['USER_ID'] ?? "";
    }

    public function getDatabaseUrl(): string
    {
        $host = $_ENV['POSTGRES_HOST'] ?? 'localhost';
        $port = $_ENV['POSTGRES_PORT'] ?? '5432';
        $dbname = $_ENV['POSTGRES_DB'] ?? 'manageshop_store';
        $user = $_ENV['POSTGRES_USER'] ?? 'postgres';
        $password = $_ENV['POSTGRES_PASSWORD'] ?? 'password';
        
        return "postgresql://{$user}:{$password}@{$host}:{$port}/{$dbname}";
    }

    public function getDatabaseName(): string
    {
        return $_ENV['POSTGRES_DB'] ?? 'manageshop_store';
    }

    public function getDatabaseHost(): string
    {
        return $_ENV['POSTGRES_HOST'] ?? 'localhost';
    }

    public function getDatabasePort(): string
    {
        return $_ENV['POSTGRES_PORT'] ?? '5432';
    }

    public function getDatabaseUser(): string
    {
        return $_ENV['POSTGRES_USER'] ?? 'postgres';
    }

    public function getDatabasePassword(): string
    {
        return $_ENV['POSTGRES_PASSWORD'] ?? 'password';
    }

    public function getPort(): int
    {
        return (int) ($_ENV['PORT'] ?? 4001);
    }
} 