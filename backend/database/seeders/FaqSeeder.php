<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    
    public function run(): void
    {
        Faq::updateOrCreate(
            [ 
                'page' => 'contact',
                'question' => 'How do I book a villa?',
            ],

            [
                'answer' => 'Choose a villa, select your dates, and follow the booking steps.',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );
    } 
}
