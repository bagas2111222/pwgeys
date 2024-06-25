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
        Schema::create('pegawais', function (Blueprint $table) {
            // $table->id();
            $table->unsignedBigInteger('id_users'); // Tambahkan kolom untuk foreign key
            $table->unsignedBigInteger('id_CabangKota'); // Tambahkan kolom untuk foreign key
            $table->timestamps();

            // Tambahkan foreign key constraint
            $table->foreign('id_users')->references('id')->on('users')->cascadeOnDelete();        
            $table->foreign('id_CabangKota')->references('id')->on('cabang_kotas')->cascadeOnDelete();        
            $table->string('jabatan')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pegawais', function (Blueprint $table) {
            // Hapus foreign key constraint
            $table->dropForeign(['id_users']);
            $table->dropForeign(['id_CabangKota']);

        });
        Schema::dropIfExists('pegawais');
    }
};
