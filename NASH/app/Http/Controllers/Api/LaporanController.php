<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    public function index()
    {
        // Ambil semua data laporan
        $laporans = Laporan::all();

        // Loop melalui setiap laporan dan tambahkan data pegawai dan users
        foreach ($laporans as $laporan) {
            // Ambil data pegawai dan users berdasarkan id_users dari laporan
            $pegawai = $laporan->pegawai;
            $user = $pegawai->user;

            // Tambahkan data pegawai dan users ke dalam array laporan
            $laporan->pegawai = $pegawai;
            $laporan->user = $user;
        }

        // Mengembalikan response JSON yang berisi data laporans beserta data pegawai dan users
        return response()->json($laporans, 200);
    }
    public function byUser($id_user)
    {
        $laporan = Laporan::where('id_users', $id_user)->get();
        
        if ($laporan->isEmpty()) {
            return response()->json(['message' => 'Tidak ada laporan yang ditemukan untuk user ini'], 404);
        }

        return response()->json([$laporan], 200);
    }
    public function byUserPegawais()
    {
        $userId = auth()->user()->id; // Get the ID of the authenticated user

        $laporan = Laporan::where('id_users', $userId)->get();
        
        if ($laporan->isEmpty()) {
            return response()->json(['message' => 'Tidak ada laporan yang ditemukan untuk user ini'], 404);
        }

        return response()->json([$laporan], 200);
    }
    public function byUserAndDate($id_user, $bulan, $tahun)
    {
        $laporan = Laporan::with('user') // tambahkan eager loading untuk relasi user
            ->where('id_users', $id_user)
            ->whereMonth('tgl_aktifitas', $bulan)
            ->whereYear('tgl_aktifitas', $tahun)
            ->get();

        if ($laporan->isEmpty()) {
            return response()->json(['message' => 'Tidak ada laporan yang ditemukan untuk user ini pada bulan dan tahun yang dimaksud'], 404);
        }

        return response()->json([$laporan], 200);
    }
    public function create(Request $request)
{
    try {
        // Validate the incoming request data
        $request->validate([
            'id_users' => 'required',
            'tgl_aktifitas' => 'required|date',
            'aktifitas' => 'required|string|max:255',
            'jenis_produk' => 'required|string|max:255',
            'closing' => 'required|boolean',
        ]);

        // Nilai bintang untuk setiap jenis produk
        $bintangValues = [
            'Kunjungan (Visit)' => 3,
            'Telepon/WA blast' => 1,
            'Update Status/ Promosi di Social Media' => 1,
            'Open Booth' => 3,
            'Presentasi/sosialisasi' => 3,
        ];

        // Tentukan nilai bintang berdasarkan jenis produk, jika tidak ada, set ke 0
        $bintang = $bintangValues[$request->input('jenis_produk')] ?? 0;

        // Create a new Laporan instance and fill it with the request data
        $laporan = Laporan::create([
            'id_users' => $request->input('id_users'),
            'tgl_aktifitas' => $request->input('tgl_aktifitas'),
            'aktifitas' => $request->input('aktifitas'),
            'jenis-produk' => $request->input('jenis_produk'),
            'closing' => $request->input('closing'),
            'ket_closing' => $request->input('ket_closing'),
            'bintang' => $bintang,
        ]);

        // Return a response indicating success
        return response()->json(['message' => 'Data berhasil dibuat', 'data' => $laporan], 201);

    } catch (\Exception $e) {
        // Return error response with appropriate message
        return response()->json(['message' => 'Gagal membuat data. ' . $e->getMessage()], 400);
    }
}


    // public function createbyauth(Request $request)
    // {
    //     $userId = auth()->user()->id; // Get the ID of the authenticated user
    //     // Validasi input jika diperlukan
    //     $request->validate([
    //         'tgl_aktifitas' => 'required|date',
    //         'aktifitas' => 'required|string|max:255',
    //         'jenis-produk' => 'required|string|max:255',
    //         'closing' => 'required|boolean',
    //     ]);

    //     // Mapping aktifitas dengan nilai closing
    //     $BintangValues = [
    //         'Kunjungan (Visit)' => 3,
    //         'Telepon/WA blast' => 1,
    //         'Update Status/ Promosi di Social Media' => 1,
    //         'Open Booth' => 3,
    //         'Presentasi/sosialisasi' => 3,
    //     ];

    //     // Tentukan nilai closing berdasarkan aktifitas
    //     $Bintang = $BintangValues[$request->input('jenis-produk')] ?? 0;

    //     // Membuat data baru
    //     $laporan = Laporan::create([
    //         'id_users' => $userId,
    //         'tgl_aktifitas' => $request->input('tgl_aktifitas'),
    //         'aktifitas' => $request->input('aktifitas'),
    //         'jenis-produk' => $request->input('jenis-produk'),
    //         'closing' => $request->input('closing'),
    //         'bintang' => $Bintang,
    //     ]);

    //     return response()->json(['message' => 'Data berhasil dibuat', 'data' => $laporan], 201);
    // }


}
