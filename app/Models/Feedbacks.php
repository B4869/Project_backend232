<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedbacks extends Model
{
    protected $fillable = ['message_id', 'feedback'];

    public function message()
    {
        return $this->belongsTo(Messages::class, 'message_id');
    }
}
