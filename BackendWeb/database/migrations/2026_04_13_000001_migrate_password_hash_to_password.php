<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        try {
            $dbName = DB::connection()->getDatabaseName();
        } catch (\Throwable $e) {
            // unable to get DB name (e.g. sqlite file missing) — skip migration
            return;
        }

        // Only run this migration when connected to the expected imported DB (laptop)
        if ($dbName !== 'laptop') {
            return;
        }

        if (!Schema::hasTable('users')) return;

        $hasPassword = Schema::hasColumn('users', 'password');
        $hasPasswordHash = Schema::hasColumn('users', 'password_hash');

        if (!$hasPassword && $hasPasswordHash) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('password')->nullable()->after('password_hash');
            });

            $users = DB::table('users')->get();
            foreach ($users as $u) {
                $pwd = $u->password_hash ?? null;
                if ($pwd === null) continue;
                // if already looks like bcrypt/hash, copy as-is, otherwise hash plaintext
                if (is_string($pwd) && str_starts_with($pwd, '$')) {
                    DB::table('users')->where('id', $u->id)->update(['password' => $pwd]);
                } else {
                    DB::table('users')->where('id', $u->id)->update(['password' => Hash::make($pwd)]);
                }
            }
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('users')) return;

        if (Schema::hasColumn('users', 'password')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('password');
            });
        }
    }
};
