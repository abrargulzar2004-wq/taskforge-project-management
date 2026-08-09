<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@taskforge.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('Admin@123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );
    }
}