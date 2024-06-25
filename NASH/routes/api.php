<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CabangBesarController;
use App\Http\Controllers\Api\CabangKotaController;
use App\Http\Controllers\Api\PegawaiController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\ReportController;

Route::post('/register', App\Http\Controllers\Api\RegisterController::class)->name('register');
Route::post('/login', App\Http\Controllers\Api\LoginController::class)->name('login');
Route::post('/registerUser', [PegawaiController::class, 'registerUser']);
Route::put('/usersedit/{id}', [PegawaiController::class, 'editUser']);

// Route untuk hapus user
Route::delete('/users/{id}', [PegawaiController::class, 'deleteUser']);
/**
 * route "/user"
 * @method "GET"
 */
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
Route::middleware('jwt.auth')->group(function () {
    Route::post('/cabang_besar/create', [CabangBesarController::class, 'create']);
    Route::get('/cabang_besar', [CabangBesarController::class, 'index']);
});
Route::get('/cabang_besar/{id}', [CabangBesarController::class, 'show']);
Route::put('/cabang_besar/edit/{id}', [CabangBesarController::class, 'edit']);
Route::DELETE('/cabang_besar/delete/{id}', [CabangBesarController::class, 'destroy']);



Route::prefix('cabang-kota')->group(function () {

    // Menampilkan semua data cabang kota
    Route::get('/all', [CabangKotaController::class, 'index']);
    // Menampilkan data cabang kota berdasarkan ID
    Route::post('/create', [CabangKotaController::class, 'create']);
    Route::get('/{id}', [CabangKotaController::class, 'show']);
    Route::get('/byCabang/{id}', [CabangKotaController::class, 'showByCabangBesar']);
    Route::put('/edit/{id}', [CabangKotaController::class, 'edit']);
    Route::DELETE('/delete/{id}', [CabangKotaController::class, 'destroy']);

});

Route::prefix('pegawai')->group(function () {

    // Menampilkan semua data cabang kota
    Route::get('/all', [PegawaiController::class, 'index']);
    Route::get('/allFull', [PegawaiController::class, 'indexUser']);
    Route::get('/byid/{id}', [PegawaiController::class, 'userbyid']);
    Route::get('/bycabangkota/{id}', [PegawaiController::class, 'showByCabangKota']);
    Route::get('/coba/{id}/{m}/{y}', [PegawaiController::class, 'calculateTotalClosing']);
    Route::get('/cobasaja', [PegawaiController::class, 'calculateByCabangOnly']);
    Route::DELETE('/delete/{id}', [PegawaiController::class, 'deleteUser']);
});
Route::prefix('laporan')->group(function () {

    // Menampilkan semua data cabang kota
    Route::get('/all', [LaporanController::class, 'index']);
    Route::get('/byuser/{id}', [LaporanController::class, 'byUser']);
    Route::get('/byusermonth/{id}/{m}/{y}', [LaporanController::class, 'byUserAndDate']);
    Route::post('/createlaporan', [LaporanController::class, 'create']);
    Route::middleware('jwt.auth')->group(function () {
        Route::get('/userPegawai', [LaporanController::class, 'byUserPegawais']);
        Route::post('/createbyauth', [LaporanController::class, 'createbyauth']);
    });

});
// Route::get('/pegawai/bycabangkota/{id}', [PegawaiController::class, 'showByCabangKota']);
Route::prefix('report')->group(function () {
    Route::get('/dash/{id}', [ReportController::class, 'getTotalClosingByCabangBesar']);
    Route::get('/all', [ReportController::class, 'index']);

    Route::get('/byuser/{id}', [ReportController::class, 'byUser']);
    Route::get('/byuserlah/{id}', [ReportController::class, 'totalReportsByCabangKota']);
    Route::get('/bycabanglah/{id}', [ReportController::class, 'totalReportsByCabangBesar']);
    Route::get('/ciba/{id}', [ReportController::class, 'reportsAndClosingByCabangBesar']);
    Route::get('/cibasaja', [ReportController::class, 'allReportsAndClosingByCabangBesar']);
    Route::middleware('jwt.auth')->group(function () {
        Route::get('/report', [ReportController::class, 'generateReport']);
    });
});

/**
 * route "/logout"
 * @method "POST"
 */
Route::post('/logout', App\Http\Controllers\Api\LogoutController::class)->name('logout');
