<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pegawai;
use App\Models\laporan;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

use Illuminate\Support\Facades\DB; // Import DB facade

class PegawaiController extends Controller

{
    public function index()
    {
        $pegawai = Pegawai::with(['user', 'cabangKota', 'cabangKota.cabangBesar'])->get();
    
        if ($pegawai->isEmpty()) {
            return response()->json(['message' => 'No Pegawai found.'], 404);
        }
    
        // Mengembalikan semua data pegawai dalam format JSON
        return response()->json([$pegawai], 200);
    }
    public function indexUser()
    {
        $pegawai = User::with(['pegawai', 'pegawai.cabangKota', 'pegawai.cabangKota.cabangBesar'])->get();

        if ($pegawai->isEmpty()) {
            return response()->json(['message' => 'No Pegawai found.'], 404);
        }

        return response()->json([$pegawai], 200);
    }
    public function userbyid($id_users)
    {
        // Validasi input
        if (!is_numeric($id_users)) {
            return response()->json(['message' => 'Invalid input.'], 400);
        }

        // Mengambil pegawai dengan eager loading
        $pegawai = User::with(['pegawai', 'pegawai.cabangKota', 'pegawai.cabangKota.cabangBesar'])
                        ->where('id', $id_users)
                        ->first();

        // Menangani jika tidak ada pegawai yang ditemukan
        if (!$pegawai) {
            return response()->json(['message' => 'Pegawai not found.'], 404);
        }

        // Mengembalikan data pegawai
        return response()->json($pegawai, 200);
    }

    public function registerUser(Request $request)
    {
        //set validation
        $validator = Validator::make($request->all(), [
            'name'      => 'required',
            'role'      => 'required',
            'email'     => $request->role === 'admin' ? 'required|unique:users' : 'nullable|unique:users',
            'password'  => $request->role === 'admin' ? 'required' : 'nullable',
            'id_CabangKota' => 'required', // tambahan validasi untuk id_CabangKota jika rolenya pegawai
            'jabatan'   => 'required'       // tambahan validasi untuk jabatan jika rolenya user
        ]);

        //if validation fails
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        //create user
        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'role'      => $request->role,
            'password'  => bcrypt($request->password)
        ]);

        // Check role, if role is admin, no need to create employee data
        if($user && $user->role === 'admin') {
            //return response JSON user is created
            return response()->json([
                'success' => true,
                'user'    => $user,  
            ], 201);
        }

        // Check if role is user, then create employee data
        if($user && $user->role === 'pegawai') {
            //create pegawai
            $pegawai = Pegawai::create([
                'id_users'      => $user->id, // id user yang baru dibuat
                'id_CabangKota' => $request->id_CabangKota,
                'jabatan'       => $request->jabatan
            ]);

            //return response JSON user dan pegawai berhasil dibuat
            if($pegawai) {
                return response()->json([
                    'success' => true,
                    'user'    => $user,
                    'pegawai' => $pegawai
                ], 201);
            }
        }

    }
    
    public function editUser(Request $request, $id)
{
    //set validation
    $validator = Validator::make($request->all(), [
        'name'      => 'required',
        'role'      => 'required',
        'email'     => $request->role === 'admin' ? 'required|unique:users,email,'.$id : 'nullable|unique:users,email,'.$id,
        'password'  => $request->role === 'admin' ? 'required' : 'nullable',
        'id_CabangKota' => 'required_if:role,pegawai', // tambahan validasi untuk id_CabangKota jika rolenya pegawai
        'jabatan'   => 'required_if:role,pegawai'       // tambahan validasi untuk jabatan jika rolenya user
    ]);

    //if validation fails
    if ($validator->fails()) {
        return response()->json($validator->errors(), 422);
    }

    //find user by id
    $user = User::find($id);

    //if user not found
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    //update user data
    $user->name = $request->name;
    $user->email = $request->email;
    $user->role = $request->role;
    
    // Check if password is provided and not empty
    if ($request->filled('password')) {
        $user->password = bcrypt($request->password);
    }
    // Save the updated user
    $user->save();

    // Check role, if role is admin, no need to update employee data
    if($user->role === 'admin') {
        //return response JSON user is updated
        return response()->json([
            'success' => true,
            'user'    => $user,  
        ], 200);
    }

    // Check if role is user, then update employee data
    if($user->role === 'pegawai') {
        //find pegawai by user id
        $pegawai = Pegawai::where('id_users', $user->id)->first();

        //if pegawai not found
        if (!$pegawai) {
            return response()->json(['error' => 'Employee data not found'], 404);
        }

        //update pegawai data
        $pegawai->id_CabangKota = $request->id_CabangKota;
        $pegawai->jabatan = $request->jabatan;

        // Save the updated pegawai
        $pegawai->save();

        //return response JSON user dan pegawai berhasil diupdate
        return response()->json([
            'success' => true,
            'user'    => $user,
            'pegawai' => $pegawai
        ], 200);
    }
}

public function deleteUser($id)
{
    // Temukan pengguna berdasarkan ID
    $user = User::find($id);

    // Jika pengguna tidak ditemukan, kembalikan respon dengan status 404
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    // Hapus pegawai terkait jika pengguna memiliki peran pegawai
    if ($user->role === 'pegawai') {
        $pegawai = Pegawai::where('id_users', $user->id)->first();
        if ($pegawai) {
            $pegawai->delete();
        }
    }

    // Hapus pengguna
    $user->delete();

    // Kembalikan respon JSON
    return response()->json(['success' => true, 'message' => 'User deleted successfully'], 200);
}


    
    public function showByCabangKota($id_CabangKota)
    {
        $pegawai = Pegawai::with(['user', 'cabangKota', 'cabangKota.cabangBesar'])->where('id_CabangKota', $id_CabangKota)->get();

        if ($pegawai->isEmpty()) {
            return response()->json(['message' => 'Pegawai not found for the given Cabang Kota ID'], 404);
        }

        // Mengembalikan data dalam format JSON, termasuk nama pegawai, nama cabang, dan data cabang besar berdasarkan id_CabangKota
        return response()->json([$pegawai], 200);
    }
    public function calculateTotalClosing($id_CabangKota, $bulan, $tahun)
    {
        // Mengambil pegawai berdasarkan id_CabangKota
        $pegawai = Pegawai::with(['user', 'cabangKota', 'cabangKota.cabangBesar'])
            ->where('id_CabangKota', $id_CabangKota)
            ->get();

        if ($pegawai->isEmpty()) {
            return response()->json(['message' => 'Pegawai not found for the specified id_CabangKota'], 404);
        }

        $response = [];

        foreach ($pegawai as $data) {
            // Mengambil laporan untuk setiap pegawai berdasarkan bulan dan tahun
            $laporan = Laporan::where('id_users', $data->id_users)
                ->whereMonth('tgl_aktifitas', $bulan)
                ->whereYear('tgl_aktifitas', $tahun)
                ->get();

            $totalLaporan = $laporan->count(); // Menghitung jumlah laporan
            $total_bintang = $laporan->sum('bintang') ?? 0; // Menghitung total closing
            $total_closing = $laporan->sum('closing') ?? 0; // Menghitung total closing

            // Menyimpan data untuk setiap pegawai
            $pegawaiData = [
                'pegawai' => $data,
                'total_laporan' => $totalLaporan,
                'total_closing' => $total_closing,
                'total_bintang' => $total_bintang,
            ];

            array_push($response, $pegawaiData);
        }

        return response()->json([$response], 200);
    }
    public function calculateByCabangOnly()
{
    // Mengambil semua pegawai
    $pegawai = Pegawai::with(['user', 'cabangKota', 'cabangKota.cabangBesar'])->get();

    if ($pegawai->isEmpty()) {
        return response()->json(['message' => 'No employees found'], 404);
    }

    $response = [];

    foreach ($pegawai as $data) {
        // Mengambil semua laporan untuk setiap pegawai tanpa filter bulan dan tahun
        $laporan = Laporan::where('id_users', $data->id_users)->get();

        // Mengelompokkan laporan berdasarkan periode bulan dan tahun
        $groupedByPeriod = $laporan->groupBy(function ($item) {
            // Ensure tgl_aktifitas is a Carbon date instance
            $date = \Carbon\Carbon::parse($item->tgl_aktifitas);
            return $date->format('Y-m'); // Format: YYYY-MM
        });

        foreach ($groupedByPeriod as $period => $reports) {
            $totalLaporan = $reports->count(); // Menghitung jumlah laporan
            $total_closing = $reports->sum('closing'); // Menghitung total closing
            $total_Bintang = $reports->sum('bintang'); // Menghitung total closing

            // Menghitung presentase closing
            $presentaseClosing = $totalLaporan > 0 ? ($total_closing / $totalLaporan) * 100 : 0;

            // Menyimpan data untuk setiap pegawai dan setiap periode
            $pegawaiData = [
                'pegawai' => [
                    'data' => $data,
                    'periode' => [
                        $period => [
                            'total_laporan' => $totalLaporan,
                            'total_closing' => $total_closing,
                            'total_bintang' => $total_Bintang,
                            'presentase_closing' => $presentaseClosing . '%'
                        ]
                    ]
                ]
            ];

            array_push($response, $pegawaiData);
        }
    }

    return response()->json($response, 200);
}


}