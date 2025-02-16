<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    protected $fillable = ['history_id', 'message', 'sender'];

    public function history()
    {
        return $this->belongsTo(Histories::class, 'history_id');
    }

    public function feedback()
    {
        return $this->belongsTo(Feedbacks::class, 'message_id');
    }
}