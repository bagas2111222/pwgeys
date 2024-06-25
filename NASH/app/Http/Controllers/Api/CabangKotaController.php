<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CabangKota;
use Illuminate\Http\Request;

class CabangKotaController extends Controller
{
    public function index()
    {
        $cabangKotas = CabangKota::with('cabangBesar')->get();
        return response()->json([$cabangKotas], 200);
    }
    public function show($id)
    {
        $cabangKota = CabangKota::find($id);

        if (!$cabangKota) {
            return response()->json(['message' => 'Cabang kota not found'], 404);
        }

        return response()->json([$cabangKota], 200);
        
    }
    public function showByCabangBesar($id_cabangBesar)
    {
        // $cabangKotas1 = CabangKota::where('id_cabangBesar', $id_cabangBesar)->get();
        $cabangKotas = CabangKota::where('id_cabangBesar', $id_cabangBesar)->with('cabangBesar')->get();

        if ($cabangKotas->isEmpty()) {
            return response()->json(['message' => 'Cabang kota not found for given cabang besar ID'], 404);
        }

        // Mengembalikan data dalam format JSON
        return response()->json([$cabangKotas], 200);
    }
    public function create(Request $request)
    {
        // Validasi input jika diperlukan
        $request->validate([
            'nama_cabang' => 'required|string',
            'id_cabangBesar' => 'required',
        ]);

        // Membuat data baru
        $CabangKota = CabangKota::create([
            'id_cabangBesar' => $request->id_cabangBesar,
            'nama_cabang' => $request->nama_cabang,
        ]);

        return response()->json(['message' => 'Data berhasil dibuat', 'data' => $CabangKota], 201);
    }
    public function edit(Request $request, $id)
    {
        // Cari data cabang_besar berdasarkan ID
        $CabangKota = CabangKota::find($id);

        // Jika data tidak ditemukan, kembalikan response error
        if (!$CabangKota) {
            return response()->json(['error' => 'Data not found'], 404);
        }

        // Validasi input jika diperlukan
        $request->validate([
            'nama_cabang' => 'required|string',
            'id_cabangBesar' => 'required',        
        ]);

        // Update data
        $CabangKota->nama_cabang = $request->nama_cabang;
        $CabangKota->id_cabangBesar = $request->id_cabangBesar;

        $CabangKota->save();

        return response()->json(['message' => 'Data berhasil diubah', 'data' => $CabangKota], 200);
    }

    public function destroy($id)
    {
        // Cari data cabang_besar berdasarkan ID
        $CabangKota = CabangKota::find($id);

        // Jika data tidak ditemukan, kembalikan response error
        if (!$CabangKota) {
            return response()->json(['error' => 'Data not found'], 404);
        }

        // Hapus data
        $CabangKota->delete();

        return response()->json(['message' => 'Data berhasil dihapus'], 200);
    }
}
