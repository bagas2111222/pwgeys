<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class laporan extends Model
{
    use HasFactory;
    protected $table = 'laporans';

    protected $fillable = [
        'id_users',
        'tgl_aktifitas',
        'aktifitas',
        'jenis-produk',
        'closing',
        'bintang',
        'ket_closing',

    ];
    protected $dates = [
        'tgl_aktifitas', // Add this line
    ];
    // Relasi dengan tabel cabang_besars
    public function cabangBesar()
    {
        return $this->belongsTo(cabang_besar::class, 'id_cabangBesar');
    }
    // Di dalam model Laporan
    public function scopeOrderByDate($query, $order = 'asc')
    {
        return $query->orderBy('tgl_aktifitas', $order);
    }
    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'id_users');
    }

    // Definisikan relasi dengan model User
    public function user()
    {
        return $this->belongsTo(User::class, 'id_users');
    }


}
