<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeBases;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FontendController extends Controller
{
    //
    public function chatIndex()
    {
        return Inertia::render('ChatBot/Chat', []);
    }

    public function uploadDataIndex()
    {
        return Inertia::render('UploadData', []);
    }

    public function uploadDataStore(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json',
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
}
