<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AIService
{
    public function generateSQL($question, $schema)
    {
        $prompt = "
        You are an SQL generator.

        Database schema:
        {$schema}

        Rules:
        - ONLY RETURN SQL
        - ONLY SELECT QUERY
        - NO EXPLANATION
        - SQLITE ONLY (not MySQL)
        - Use RANDOM() instead of RAND()
        - Use strftime('%Y-%m', tanggal) for month filtering

        User question:
        {$question}
        ";

        $response = Http::withHeaders([

            'Authorization' => 'Bearer ' . env('OPENROUTER_API_KEY'),

            'HTTP-Referer' => 'http://localhost',

            'X-Title' => 'NL2SQL',

            'Content-Type' => 'application/json'

        ])->post(
            'https://openrouter.ai/api/v1/chat/completions',
            [

                'model' => env('OPENROUTER_MODEL'),

                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],

                'temperature' => 0

            ]
        );

        return trim(
            $response['choices'][0]['message']['content']
        );
    }
}