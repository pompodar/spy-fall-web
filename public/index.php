<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../spy/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../../../spy/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../../../spy/bootstrap/app.php')
    ->handleRequest(Request::capture());
