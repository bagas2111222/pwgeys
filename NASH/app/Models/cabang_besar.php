<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class cabang_besar extends Model
{
    use HasFactory;
    protected $table = 'cabang_besars';

    protected $fillable = [
        'nama_kota',
    ];
}
