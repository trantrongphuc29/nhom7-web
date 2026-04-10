<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Carbon;

class JwtService
{
    public function makeToken(User $user): string
    {
        $now = Carbon::now()->timestamp;
        $ttl = (int) env('JWT_TTL', 60 * 24);
        $payload = [
            'iss' => config('app.url'),
            'iat' => $now,
            'exp' => $now + ($ttl * 60),
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
        ];

        return JWT::encode($payload, $this->secret(), 'HS256');
    }

    public function decode(string $token): object
    {
        return JWT::decode($token, new Key($this->secret(), 'HS256'));
    }

    private function secret(): string
    {
        return (string) env('JWT_SECRET', config('app.key'));
    }
}
