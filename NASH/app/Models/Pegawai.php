<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\laporan;

class Pegawai extends Model
{
    use HasFactory;
    protected $table = 'pegawais';
    protected $primaryKey = 'id_users'; // Specify the primary key

    protected $fillable = [
        'id_users',
        'id_CabangKota', // Tambahkan kolom foreign key sebagai fillable
        'jabatan',
    ];

    // Relasi dengan tabel cabang_besars
    public function CabangKota()
    {
        return $this->belongsTo(CabangKota::class, 'id_CabangKota');
    }
    
    public function getCabangKota()
    {
        return CabangKota::find($this->id_CabangKota);
    }
        // Relasi dengan tabel users
    public function user()
    {
        return $this->belongsTo(User::class, 'id_users');
    }
    
    
    // Relasi dengan tabel laporans
    public function laporans()
    {
        return $this->hasMany(laporan::class, 'id_users');
    }
    // Relasi dengan model Laporan
    public function laporan()
    {
        return $this->hasMany(Laporan::class, 'id_users');
    }
    // Menghitung total last-closing berdasarkan id_users
    public function calculateTotalClosing()
    {
        return Laporan::where('id_users', $this->id_users)->sum('closing');
    }

    public static function getTotalReportsByCabangKota($id_CabangKota)
    {
        // Get all id_users for the given id_CabangKota
        $id_users = self::where('id_CabangKota', $id_CabangKota)->pluck('id_users')->toArray();

        // Get total reports for those id_users
        $totalReports = Laporan::whereIn('id_users', $id_users)->count();

        return $totalReports;
    }
    public function getUser()
    {
        return User::find($this->id_users);
    }
}
