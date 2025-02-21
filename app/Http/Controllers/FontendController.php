<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeBases;
use App\Models\RuleBases;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FontendController extends Controller
{
    //show screen
    public function chatIndex()
    {
        return Inertia::render('ChatBot/Chat', []);
    }

    public function adminIndex()
    {
        $rule_base = RuleBases::get();

        return Inertia::render('Admin', ["rule_bases" => $rule_base]);
    }




    public function uploadDataStore(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        $json = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($json, true);

        // Log the contents of the JSON file
        // Log::info('Uploaded JSON data: ', $data);

        // Ensure $data is an array
        if (is_array($data)) {
            foreach ($data as $item) {
                // Ensure each item contains 'content' and 'embedding' keys
                if (isset($item['content']) && isset($item['embedding'])) {
                    KnowledgeBases::create([
                        'content' => $item['content'],
                        'embedding' => $item['embedding']
                    ]);
                } else {
                    return back()->with('error', ' Please try again.');
                }
            }
            return redirect('')->with('success', 'Data added successfully');
        } else {
            return back()->with('error', 'Please try again.');
        }
    }


    

    public function storeRuleBase(Request $request)
    {
        $request->validate([
            'rule' => 'required|string'
        ]);

        $ruleBase = RuleBases::create([
            'rule' => $request->rule
        ]);

        return redirect()->back()->with('success', 'Rule created successfully');
    }

    public function updateRuleBase(Request $request, $id)
    {
        $request->validate([
            'rule' => 'required|string'
        ]);

        $ruleBase = RuleBases::findOrFail($id);
        $ruleBase->update([
            'rule' => $request->rule
        ]);

        return redirect()->back()->with('success', 'Rule updated successfully');
    }

    public function destroyRuleBase($id)
    {
        $ruleBase = RuleBases::findOrFail($id);
        $ruleBase->delete();

        return redirect()->back()->with('success', 'Rule deleted successfully');
    }
}
