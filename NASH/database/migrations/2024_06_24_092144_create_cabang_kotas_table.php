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
        Schema::create('cabang_kotas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_cabang');
            $table->unsignedBigInteger('id_cabangBesar'); // Tambahkan kolom untuk foreign key
            $table->timestamps();
            // Tambahkan foreign key constraint
            $table->foreign('id_cabangBesar')->references('id')->on('cabang_besars')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cabang_kotas', function (Blueprint $table) {
            // Hapus foreign key constraint
            $table->dropForeign(['id_cabangBesar']);
        });

        Schema::dropIfExists('cabang_kotas');
    }
};
