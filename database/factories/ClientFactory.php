<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'contact_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '(44) 99999-0000',
            'plan' => 'Site institucional',
            'notes' => null,
        ];
    }
}
