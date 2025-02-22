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
    /**
     * ===== Main Chat Flow =====
     * หลัก: ask() -> getOrCreateHistory() -> saveMessage() -> processQueryAndGetResponse()
     */
    public function ask(Request $request): array
    {
        try {
            // 1. Get request data and user
            $query = $request->post('content');
            $historyId = $request->post('history_id');
            $user = Auth::user();

            // 2. Get or create chat history
            $history = $this->getOrCreateHistory($historyId, $user->id);

            // 3. Save user message
            $this->saveMessage($history->id, $query, 'user');

            // 4. Process query and get response
            $answer = $this->processQueryAndGetResponse($query, $history->id);

            // 5. Save AI response
            $this->saveMessage($history->id, $answer, 'assistant');

            return [
                'message' => $answer,
                'history_id' => $history->id
            ];
        } catch (Throwable $e) {
            Log::error('Chat processing error: ' . $e->getMessage());
            return ["Error: " . $e->getMessage()];
        }
    }

    private function getOrCreateHistory($historyId, $userId)
    {
        return $historyId
            ? Histories::findOrFail($historyId)
            : Histories::create(['user_id' => $userId]);
    }

    private function saveMessage($historyId, $message, $sender)
    {
        return Messages::create([
            'history_id' => $historyId,
            'message' => $message,
            'sender' => $sender
        ]);
    }

    /**
     * ===== Query Processing Flow =====
     * หลัก: processQueryAndGetResponse() -> generateEmbedding() -> calculateSimilarities() -> 
     *       getTopSimilarEntries() -> buildContext() -> getChatHistory() -> generateAnswer()
     */
    private function processQueryAndGetResponse($query, $historyId)
    {
        // 1. Generate query embedding
        $queryEmbedding = $this->generateEmbedding($query);

        // 2. Get and process knowledge base entries
        $entries = KnowledgeBases::all();
        $this->processKnowledgeBaseEmbeddings($entries);

        // 3. Find similar entries
        $similarities = $this->calculateSimilarities($queryEmbedding, $entries);
        $topSimilar = $this->getTopSimilarEntries($similarities, 10);

        // 4. Build context and get chat history
        $context = $this->buildContext($topSimilar);
        $historyMessages = $this->getChatHistory($historyId);

        // 5. Generate and return answer
        return $this->generateAnswer($query, $context, $historyMessages);
    }

    private function generateEmbedding(string $text): array
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post('https://640510702phithak-text-embedding-api.hf.space/embed', [
                'input' => $text,
            ]);

            if ($response->failed()) {
                throw new \Exception('Embedding Error: ' . $response->json()['error']['message']);
            }

            return $response->json()['embedding'];
        } catch (Throwable $e) {
            Log::error('Error generating embedding: ' . $e->getMessage());
            throw $e;
        }
    }

    private function processKnowledgeBaseEmbeddings($entries)
    {
        foreach ($entries as $entry) {
            if (!$entry->embedding && $entry->content) {
                $entry->embedding = $this->generateEmbedding($entry->content);
                $entry->save();
            }
        }
    }

    private function calculateSimilarities($queryEmbedding, $entries)
    {
        $similarities = [];
        foreach ($entries as $entry) {
            if ($entry->embedding) {
                $similarities[] = [
                    'entry' => $entry,
                    'score' => $this->cosineSimilarity($queryEmbedding, $entry->embedding)
                ];
            }
        }
        return $similarities;
    }

    private function getTopSimilarEntries($similarities, $limit)
    {
        usort($similarities, fn($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($similarities, 0, $limit);
    }

    private function buildContext($topSimilar)
    {
        return "**knowledge bases**\n\n" . collect($topSimilar)
            ->pluck('entry.content')
            ->map(fn($content) => "- $content")
            ->implode("\n\n");
    }

    private function getChatHistory($historyId)
    {
        return Messages::where('history_id', $historyId)
            ->orderBy('id', 'asc')
            ->take(-4)
            ->get()
            ->map(function ($message) {
                return [
                    'role' => $message->sender,
                    'content' => $message->message
                ];
            })
            ->values()
            ->all();
    }

    private function generateAnswer(string $query, string $context, array $historyMessages): string
    {
        try {
            // Get rules from RuleBases
            $rules = RuleBases::pluck('rule')->toArray();

            // Prepare messages array with system rules
            $messages = collect($rules)
                ->map(fn($rule) => ['role' => 'system', 'content' => $rule])
                ->merge($historyMessages)
                ->push(['role' => 'assistant', 'content' => $context])
                ->push(['role' => 'user', 'content' => $query])
                ->all();

            // Make API request
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('OPENROUTER_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'google/gemini-2.0-flash-lite-preview-02-05:free',
                'messages' => $messages,
            ]);

            if ($response->failed()) {
                throw new \Exception('OpenRouter API Error: ' .
                    ($response->json()['error']['message'] ?? 'Unknown error'));
            }

            $responseData = $response->json();
            if (isset($responseData['choices'][0]['message']['content'])) {
                return $responseData['choices'][0]['message']['content'];
            }

            throw new \Exception('Unexpected response format from OpenRouter API.');
        } catch (Throwable $e) {
            Log::error('Error generating answer: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * ===== Math Utility =====
     */
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

    /**
     * ===== History Management =====
     * Functions ที่เกี่ยวกับการจัดการประวัติการแชท
     */
    public function createNewChat()
    {
        try {
            $user = Auth::user();
            $newHistory = Histories::create(['user_id' => $user->id]);
            return response()->json(['history_id' => $newHistory->id]);
        } catch (Throwable $e) {
            Log::error('Error creating new chat: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getHistory($historyId = null)
    {
        try {
            $user = Auth::user();
            $history = $this->findUserHistory($user->id, $historyId);
            $messages = $history->messages()->orderBy('created_at')->get();

            return [
                'history_id' => $history->id,
                'messages' => $messages,
                'chat_name' => $this->generateChatName($messages)
            ];
        } catch (Throwable $e) {
            Log::error('Error fetching history: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getUserChatHistories()
    {
        try {
            $user = Auth::user();
            $histories = Histories::where('user_id', $user->id)
                ->with(['messages' => function ($query) {
                    $query->where('sender', 'user')
                        ->orderBy('created_at')
                        ->limit(1);
                }])
                ->orderBy('updated_at', 'desc')
                ->get()
                ->map(function ($history) {
                    return [
                        'id' => $history->id,
                        'chat_name' => $this->generateChatName($history->messages),
                        'updated_at' => $history->updated_at
                    ];
                });

            return response()->json($histories);
        } catch (Throwable $e) {
            Log::error('Error fetching chat histories: ' . $e->getMessage());
            throw $e;
        }
    }

    public function delete(Histories $id)
    {
        try {
            $id->delete();
            return back()->with('success', 'History deleted successfully');
        } catch (Throwable $e) {
            Log::error('Error deleting history: ' . $e->getMessage());
            return back()->with('error', $e->getMessage() . ' Please try again.');
        }
    }

    private function findUserHistory($userId, $historyId = null)
    {
        return $historyId
            ? Histories::where('user_id', $userId)->findOrFail($historyId)
            : Histories::where('user_id', $userId)->latest()->firstOrFail();
    }

    private function generateChatName($messages)
    {
        $firstUserMessage = $messages->where('sender', 'user')->first();
        return $firstUserMessage ? substr($firstUserMessage->message, 0, 50) : 'New Chat';
    }
}
