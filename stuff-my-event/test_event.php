<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$event = App\Models\Event::with(['agency', 'requirements', 'compensation', 'messages', 'assignments'])->find(1);

if (!$event) {
    echo "Event with ID 1 not found!\n";
    echo "Available events:\n";
    $events = App\Models\Event::all();
    foreach ($events as $e) {
        echo "ID: {$e->id} - {$e->name}\n";
    }
    exit;
}

echo "Event found: {$event->name}\n";
echo "Status: {$event->status->value}\n";
echo "Agency: " . ($event->agency ? $event->agency->name : 'N/A') . "\n";
echo "Requirements: " . ($event->requirements ? 'Yes' : 'No') . "\n";
echo "Compensation: " . ($event->compensation ? 'Yes' : 'No') . "\n";
echo "Messages count: " . $event->messages->count() . "\n";
echo "Assignments count: " . $event->assignments->count() . "\n";
