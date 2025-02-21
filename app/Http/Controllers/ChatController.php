<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeBases;
use App\Models\Histories;
use App\Models\Messages;
use App\Models\RuleBases;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    // fontend controller
    public function index()
    {
        return Inertia::render('ChatBot/Chat', []);
    }

    public function ask(Request $request): array
    {
        try {
            $query = $request->post('content');
            $historyId = $request->post('history_id');
            $user = Auth::user();

            $messages = Messages::where('history_id', $historyId)
                ->orderBy('id', 'asc')
                ->get(['sender', 'message']);

            // ใช้ history_id ที่ส่งมา หรือสร้างใหม่ถ้าไม่มี
            $history = $historyId
                ? Histories::findOrFail($historyId)
                : Histories::create(['user_id' => $user->id]);

            // บันทึกข้อความของผู้ใช้
            Messages::create([
                'history_id' => $history->id,
                'message' => $query,
                'sender' => 'user'
            ]);

            // 1. Generate query embedding
            $queryEmbedding = $this->generateEmbedding($query);

            // Log::info($queryEmbedding); debug embed

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
            $topSimilar = array_slice($similarities, 0, 5);

            // Log::info($topSimilar);

            // 6. Build context
            $context = collect($topSimilar)
                ->pluck('entry.content')
                ->map(fn($content) => "- $content")
                ->implode("\n\n");

            $historyMessages = $messages->map(function ($message) {
                return [
                    'role' => $message->sender,
                    'content' => $message->message
                ];
            })->values()->all();

            // 7. Generate answer
            $answer = $this->generateAnswer($query, $context, $historyMessages);

            // Save assistant message
            Messages::create([
                'history_id' => $history->id,
                'message' => $answer,
                'sender' => 'assistant'
            ]);

            return [
                'message' => $answer,
                'history_id' => $history->id
            ];
        } catch (Throwable $e) {
            return "Error: " . $e->getMessage();
        }
    }

    public function getHistory($historyId = null)
    {
        $user = Auth::user();

        if ($historyId) {
            $history = Histories::where('user_id', $user->id)
                ->findOrFail($historyId);
        } else {
            $history = Histories::where('user_id', $user->id)
                ->latest()
                ->firstOrFail();
        }

        $messages = $history->messages()->orderBy('created_at')->get();

        $firstUserMessage = $messages->where('sender', 'user')->first();
        $chatName = $firstUserMessage ? substr($firstUserMessage->message, 0, 50) : 'New Chat';

        return [
            'history_id' => $history->id,
            'messages' => $messages,
            'chat_name' => $chatName
        ];
    }

    public function createNewChat()
    {
        $user = Auth::user();
        $newHistory = Histories::create(['user_id' => $user->id]);
        return response()->json(['history_id' => $newHistory->id]);
    }

    public function getUserChatHistories()
    {
        $user = Auth::user();
        $histories = Histories::where('user_id', $user->id)
            ->with(['messages' => function ($query) {
                $query->where('sender', 'user')->orderBy('created_at')->limit(1);
            }])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($history) {
                $firstMessage = $history->messages->first();
                $chatName = $firstMessage ? substr($firstMessage->message, 0, 50) : 'New Chat';
                return [
                    'id' => $history->id,
                    'chat_name' => $chatName,
                    'updated_at' => $history->updated_at
                ];
            });

        return response()->json($histories);
    }

    public function delete(Histories $id)
    {
        try {
            $id->delete();

            return back()->with('success', 'History deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage() . ' Please try again.');
        }
    }

    // private function generateEmbedding(string $text): array
    // {
    //     $response = Http::withHeaders([
    //         'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
    //         'Content-Type' => 'application/json',
    //     ])->post('https://api.openai.com/v1/embeddings', [
    //         'model' => 'text-embedding-ada-002',
    //         'input' => $text,
    //     ]);

    //     if ($response->failed()) {
    //         throw new \Exception('Embedding Error: ' . $response->json()['error']['message']);
    //     }

    //     return $response->json()['data'][0]['embedding'];
    // }

    private function generateEmbedding(string $text): array
    {
        $response = Http::withHeaders([
            // 'Authorization' => 'Bearer ' . env('HF_TOKEN'),
            'Content-Type' => 'application/json',
        ])->post('https://640510702phithak-text-embedding-api.hf.space/embed', [
            'input' => $text,
        ]);

        if ($response->failed()) {
            throw new \Exception('Embedding Error: ' . $response->json()['error']['message']);
        }

        return $response->json()['embedding'];
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

    private function generateAnswer(string $query, string $context, array $historyMessages): string
    {
        $rule_base = RuleBases::value('rule');
        // Log::info($rule_base);

        $messages = [
            ['role' => 'system', 'content' => $rule_base],
            ...$historyMessages,
            ['role' => 'assistant', 'content' => $context],
            ['role' => 'user', 'content' => $query],
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENROUTER_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => 'google/gemini-2.0-flash-lite-preview-02-05:free',
            'messages' => $messages,
        ]);

        if ($response->failed()) {
            $errorData = $response->json();
            throw new \Exception('OpenRouter API Error: ' . ($errorData['error']['message'] ?? 'Unknown error'));
        }

        $responseData = $response->json();
        Log::info($responseData['choices'][0]['message']['content']);
        if (isset($responseData['choices'][0]['message']['content'])) {
            return $responseData['choices'][0]['message']['content'];
        } else {
            throw new \Exception('Unexpected response format from OpenRouter API.');
        }
    }
}
