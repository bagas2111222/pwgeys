<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CabangKota extends Model
{
    protected $table = 'cabang_kotas';

    protected $fillable = [
        'nama_cabang',
        'last_closing',
        'id_cabangBesar',
    ];

    public function cabangBesar()
    {
        return $this->belongsTo(cabang_besar::class, 'id_cabangBesar');
    }

    public static function getTotalReportsAndClosingByCabangBesar($id_cabangBesar)
    {
        // Get all CabangKota ids for the given id_cabangBesar
        $cabangKotaIds = self::where('id_cabangBesar', $id_cabangBesar)->pluck('id')->toArray();

        // Get all id_users for the retrieved CabangKota ids
        $id_users = Pegawai::whereIn('id_CabangKota', $cabangKotaIds)->pluck('id_users')->toArray();

        // Get total reports for those id_users
        $totalReports = Laporan::whereIn('id_users', $id_users)->count();

        // Get total closing for those id_users
        $totalClosing = Laporan::whereIn('id_users', $id_users)->sum('closing');

        // Fetch the related CabangBesar data
        $cabangBesar = cabang_besar::find($id_cabangBesar);

        return [
            'totalReports' => $totalReports,
            'totalClosing' => $totalClosing,
            'cabangBesar' => $cabangBesar
        ];
    }
    public static function getReportsAndClosingByCabangBesar($id_cabangBesar)
    {
        // Get all CabangKota ids for the given id_cabangBesar
        $cabangKotaIds = self::where('id_cabangBesar', $id_cabangBesar)->pluck('id')->toArray();

        // Get all id_users for the retrieved CabangKota ids
        $id_users = Pegawai::whereIn('id_CabangKota', $cabangKotaIds)->pluck('id_users')->toArray();

        // Group total reports and total closing by month and year
        $reportsAndClosing = Laporan::whereIn('id_users', $id_users)
            ->select(
                DB::raw('YEAR(tgl_aktifitas) as year'),
                DB::raw('MONTH(tgl_aktifitas) as month'),
                DB::raw('COUNT(*) as totalReports'),
                DB::raw('SUM(closing) as totalClosing')
            )
            ->groupBy('year', 'month')
            ->get();

        // Fetch the related CabangBesar data
        $cabangBesar = cabang_besar::find($id_cabangBesar);

        $formattedReportsAndClosing = $reportsAndClosing->map(function ($report) use ($cabangBesar) {
            return [
                'nama' => $cabangBesar->nama_kota,
                'bulan' => date('F Y', mktime(0, 0, 0, $report->month, 1, $report->year)),
                'totalReports' => $report->totalReports,
                'totalClosing' => $report->totalClosing
            ];
        });

        return [
            'cabangBesar' => $cabangBesar,
            'reportsAndClosing' => $formattedReportsAndClosing
        ];
    }
    public static function getAllReportsAndClosingByCabangBesar()
    {
        // Get all CabangKota ids and group them by id_cabangBesar
        $cabangKotaGroups = self::select('id_cabangBesar', 'id')->get()->groupBy('id_cabangBesar');

        $results = [];

        foreach ($cabangKotaGroups as $id_cabangBesar => $cabangKotas) {
            // Get all id_users for the retrieved CabangKota ids
            $id_users = Pegawai::whereIn('id_CabangKota', $cabangKotas->pluck('id'))->pluck('id_users')->toArray();

            // Group total reports and total closing by month and year
            $reportsAndClosing = Laporan::whereIn('id_users', $id_users)
                ->select(
                    DB::raw('YEAR(tgl_aktifitas) as year'),
                    DB::raw('MONTH(tgl_aktifitas) as month'),
                    DB::raw('COUNT(*) as totalReports'),
                    DB::raw('SUM(closing) as totalClosing')
                )
                ->groupBy('year', 'month')
                ->get();

            // Fetch the related CabangBesar data
            $cabangBesar = cabang_besar::find($id_cabangBesar);

            $formattedReportsAndClosing = $reportsAndClosing->map(function ($report) use ($cabangBesar) {
                return [
                    'nama' => $cabangBesar->nama_kota,
                    'bulan' => date('F Y', mktime(0, 0, 0, $report->month, 1, $report->year)),
                    'totalReports' => $report->totalReports,
                    'totalClosing' => $report->totalClosing,
                    'total' => $report->totalClosing

                ];
            })->toArray();

            // Add formatted results to the main array
            $results = array_merge($results, $formattedReportsAndClosing);
        }

        return $results;
    }
    public function pegawais()
    {
        return $this->hasMany(Pegawai::class, 'id_CabangKota');
    }

}
