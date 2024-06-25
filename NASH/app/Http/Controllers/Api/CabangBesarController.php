<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\cabang_besar;


class CabangBesarController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function index(Request $request)
    {
        // Ambil semua data cabang_besar
        $cabang_besar = cabang_besar::all();

        // Return data dalam format JSON
        return response()->json($cabang_besar, 200);
    }
    public function create(Request $request)
    {
        // Validasi input jika diperlukan
        $request->validate([
            'nama_kota' => 'required|string',
        ]);

        // Membuat data baru
        $cabang_besar = cabang_besar::create([
            'nama_kota' => $request->nama_kota,
        ]);

        return response()->json(['message' => 'Data berhasil dibuat', 'data' => $cabang_besar], 201);
    }
    public function show($id)
    {
        // Cari data cabang_besar berdasarkan ID
        $cabang_besar = cabang_besar::find($id);

        // Jika data tidak ditemukan, kembalikan response error
        if (!$cabang_besar) {
            return response()->json(['error' => 'Data not found'], 404);
        }

        // Return data dalam format JSON
        return response()->json($cabang_besar, 200);
    }
    public function edit(Request $request, $id)
{
    // Cari data cabang_besar berdasarkan ID
    $cabang_besar = cabang_besar::find($id);

    // Jika data tidak ditemukan, kembalikan response error
    if (!$cabang_besar) {
        return response()->json(['error' => 'Data not found'], 404);
    }

    // Validasi input jika diperlukan
    $request->validate([
        'nama_kota' => 'required|string',
    ]);

    // Update data
    $cabang_besar->nama_kota = $request->nama_kota;
    $cabang_besar->save();

    return response()->json(['message' => 'Data berhasil diubah', 'data' => $cabang_besar], 200);
}

public function destroy($id)
{
    // Cari data cabang_besar berdasarkan ID
    $cabang_besar = cabang_besar::find($id);

    // Jika data tidak ditemukan, kembalikan response error
    if (!$cabang_besar) {
        return response()->json(['error' => 'Data not found'], 404);
    }

    // Hapus data
    $cabang_besar->delete();

    return response()->json(['message' => 'Data berhasil dihapus'], 200);
}


}
