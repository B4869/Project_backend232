<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeBases;
use App\Models\RuleBases;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FontendController extends Controller
{
    /**
     * ===== View Rendering Methods =====
     */
    public function chatIndex()
    {
        return Inertia::render('ChatBot/Chat');
    }

    public function adminIndex()
    {
        try {
            $rule_base = RuleBases::get();
            return Inertia::render('Admin', ["rule_bases" => $rule_base]);
        } catch (\Exception $e) {
            Log::error('Error fetching rule bases: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load rule bases.');
        }
    }

    /**
     * ===== File Upload Management =====
     */
    public function uploadDataStore(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'file' => 'required|file',
            ]);

            // Read and parse JSON file
            $jsonContent = file_get_contents($request->file('file')->getRealPath());
            $data = json_decode($jsonContent, true);

            // Validate JSON structure
            if (!is_array($data)) {
                return back()->with('error', 'Invalid JSON format. Please check your file.');
            }

            // Process each item in the JSON data
            foreach ($data as $item) {
                // Validate item structure
                if (!isset($item['content']) || !isset($item['embedding'])) {
                    return back()->with('error', 'Invalid data structure in JSON file.');
                }

                // Create knowledge base entry
                KnowledgeBases::create([
                    'content' => $item['content'],
                    'embedding' => $item['embedding']
                ]);
            }

            return back()->with('success', 'Data uploaded successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            // Log::error('Error uploading file: ' . $e->getMessage());
            return back()->with('error', 'Error uploading file. Please try again.');
        }
    }

    /**
     * ===== Rule Base Management =====
     */
    public function storeRuleBase(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'rule' => 'required|string'
            ]);

            // Create rule
            RuleBases::create($validated);

            return redirect()->back()->with('success', 'Rule created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error creating rule: ' . $e->getMessage());
            return back()->with('error', 'Failed to create rule. Please try again.');
        }
    }

    public function updateRuleBase(Request $request, $id)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'rule' => 'required|string'
            ]);

            // Find and update rule
            $ruleBase = RuleBases::findOrFail($id);
            $ruleBase->update($validated);

            return redirect()->back()->with('success', 'Rule updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with('error', 'Rule not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating rule: ' . $e->getMessage());
            return back()->with('error', 'Failed to update rule. Please try again.');
        }
    }

    public function destroyRuleBase($id)
    {
        try {
            // Find and delete rule
            $ruleBase = RuleBases::findOrFail($id);
            $ruleBase->delete();

            return redirect()->back()->with('success', 'Rule deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with('error', 'Rule not found.');
        } catch (\Exception $e) {
            Log::error('Error deleting rule: ' . $e->getMessage());
            return back()->with('error', 'Failed to delete rule. Please try again.');
        }
    }
}
