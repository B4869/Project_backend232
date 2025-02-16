<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeBases extends Model
{
    protected $fillable = ['content', 'embedding'];

    protected $casts = [
        'embedding' => 'array',
    ];
}
