<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('laporans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_users'); // Tambahkan kolom untuk foreign key
            $table->foreign('id_users')->references('id')->on('users')->cascadeOnDelete();        
            $table->date('tgl_aktifitas');
            $table->string('aktifitas');
            $table->string('jenis-produk');
            $table->string('closing');
            $table->string('bintang');
            $table->string('ket_closing')->nullable();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporans', function (Blueprint $table) {
            // Hapus foreign key constraint
            $table->dropForeign(['id_users']);
        });
        Schema::dropIfExists('laporans');
    }
};
