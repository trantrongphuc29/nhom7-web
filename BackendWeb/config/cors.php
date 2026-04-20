<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter(array_map('trim', array_merge(
        explode(',', (string) env('FRONTEND_URLS', '')),
        [
            env('FRONTEND_URL', 'http://localhost:3000'),
            'http://127.0.0.1:3000',
            'https://nhom7-lapstore.onrender.com',
            'https://nhom7-lapstore.onrender.com/',
        ]
    )))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
