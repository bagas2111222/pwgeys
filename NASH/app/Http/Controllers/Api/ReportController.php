<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\cabang_besar;
use App\Models\CabangKota;
use App\Models\laporan;
use App\Models\Pegawai;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        // Ambil semua data laporan beserta data pegawai terkait
        $laporans = Laporan::with(['user', 'pegawai.cabangKota.cabangBesar'])->get();
        return response()->json($laporans, 200);
    }

    public function getTotalClosingByCabangBesar($id_cabangBesar)
    {
        // Get all cabang_kotas that belong to the given cabang_besar
        $cabangKotas = CabangKota::where('id_cabangBesar', $id_cabangBesar)->get();
        
        // Get all user ids from the retrieved cabang_kotas
        $userIds = $cabangKotas->pluck('id')->toArray();
        
        // Calculate the total closing from the laporan table for the retrieved user ids
        $totalReports = Laporan::whereIn('id_users', $userIds)->count();

        return response()->json([
            'id_cabangBesar' => $id_cabangBesar,
            'total_closing' => $totalReports,
        ]);
    }
    public function byUser($id_user)
    {
        try {
            // Ensure $id_user is an array, or convert it to an array if it's a single value
            $id_user = is_array($id_user) ? $id_user : [$id_user];
            
            $totalReports = Laporan::whereIn('id_users', $id_user)->count();

            return response()->json([
                'success' => true,
                'totalReports' => $totalReports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching the reports.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function totalReportsByCabangKota($id_CabangKota)
    {
        try {
            $totalReports = Pegawai::getTotalReportsByCabangKota($id_CabangKota);

            return response()->json([
                'success' => true,
                'totalReports' => $totalReports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching the reports.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function totalReportsByCabangBesar($id_cabangBesar)
    {
        try {
            $result = CabangKota::getTotalReportsAndClosingByCabangBesar($id_cabangBesar);

            return response()->json([
                'success' => true,
                'totalReports' => $result['totalReports'],
                'totalClosing' => $result['totalClosing'],
                'cabangBesar' => $result['cabangBesar']
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching the reports.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function reportsAndClosingByCabangBesar($id_cabangBesar)
    {
        try {
            $result = CabangKota::getReportsAndClosingByCabangBesar($id_cabangBesar);

            return response()->json([$result['reportsAndClosing']], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching the reports.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function allReportsAndClosingByCabangBesar()
    {
        try {
            $results = CabangKota::getAllReportsAndClosingByCabangBesar();

            return response()->json([
                'success' => true,
                'data' => $results
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching the reports.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function generateReport()
    {
        $userId = auth()->user()->id; // Get the ID of the authenticated user

        $laporan = Laporan::select(
            DB::raw('YEAR(tgl_aktifitas) as year'),
            DB::raw('MONTH(tgl_aktifitas) as month'),
            DB::raw('COUNT(*) as totalReports'),
            DB::raw('SUM(closing) as totalClosing')
        )
        ->where('id_users', $userId) // Filter based on the authenticated user's ID
        ->groupBy('year', 'month')
        ->get();

        $result = [];

        foreach ($laporan as $report) {
            $result[] = [
                'bulan' => date('F Y', mktime(0, 0, 0, $report->month, 1, $report->year)),
                'totalReports' => $report->totalReports,
                'totalClosing' => $report->totalClosing,
                'total' => $report->totalClosing
            ];
        }

        return response()->json($result);
    }
    

    //
}
