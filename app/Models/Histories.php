<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Histories extends Model
{
    protected $fillable = ['user_id'];

    public function messages()
    {
        return $this->hasMany(Messages::class, 'history_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
