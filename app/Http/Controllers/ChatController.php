<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeBases;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    // fontend controller
    public function index()
    {
        return Inertia::render('ChatBot/Chat', []);
    }


    // chatbot controller
    private array $prompt = [
        [
            'role' => 'system',
            'content' => 'Answer the question using the provided context. If unsure, say you don\'t know. Keep answers concise.'
        ]
    ];

    public function ask(Request $request): string
    {
        try {
            $query = $request->post('content');
            
            // 1. Generate query embedding
            $queryEmbedding = $this->generateEmbedding($query);
            
            // 2. Retrieve and process dataset
            $entries = KnowledgeBases::all();
            
            // 3. Generate missing embeddings
            foreach ($entries as $entry) {
                if (!$entry->embedding && $entry->content) {
                    $entry->embedding = $this->generateEmbedding($entry->content);
                    $entry->save();
                }
            }
            
            // 4. Calculate similarities
            $similarities = [];
            foreach ($entries as $entry) {
                if ($entry->embedding) {
                    $similarityScore = $this->cosineSimilarity(
                        $queryEmbedding,
                        $entry->embedding
                    );
                    
                    $similarities[] = [
                        'entry' => $entry,
                        'score' => $similarityScore
                    ];
                }
            }
            
            // 5. Sort and get top 10
            usort($similarities, fn($a, $b) => $b['score'] <=> $a['score']);
            $topSimilar = array_slice($similarities, 0, 10);
            
            // 6. Build context
            $context = collect($topSimilar)
                ->pluck('entry.content')
                ->implode("\n---\n");
            
            // 7. Generate answer
            return $this->generateAnswer($query, $context);
            
        } catch (Throwable $e) {
            return "Error: " . $e->getMessage();
        }
    }

    private function generateEmbedding(string $text): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/embeddings', [
            'model' => 'text-embedding-3-small',
            'input' => $text,
        ]);

        if ($response->failed()) {
            throw new \Exception('Embedding Error: ' . $response->json()['error']['message']);
        }

        return $response->json()['data'][0]['embedding'];
    }

    private function cosineSimilarity(array $vecA, array $vecB): float
    {
        $dotProduct = 0;
        $magA = 0;
        $magB = 0;

        foreach ($vecA as $i => $a) {
            $b = $vecB[$i] ?? 0;
            $dotProduct += $a * $b;
            $magA += $a ** 2;
            $magB += $b ** 2;
        }

        $magA = sqrt($magA);
        $magB = sqrt($magB);

        return $magA && $magB ? $dotProduct / ($magA * $magB) : 0;
    }

    private function generateAnswer(string $query, string $context): string
    {
        $messages = [
            ...$this->prompt,
            ['role' => 'assistant', 'content' => $context],
            ['role' => 'user', 'content' => $query]
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o',
            'messages' => $messages,
            'temperature' => 0.7,
        ]);

        if ($response->failed()) {
            throw new \Exception('GPT Error: ' . $response->json()['error']['message']);
        }

        return $response->json()['choices'][0]['message']['content'];
    }
}