<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Broadcast::channel('event.{eventId}', function ($user, $eventId) {

    Log::info('Channel authorization attempt', [
        'user_id' => $user->id,
        'event_id' => $eventId,
    ]);

    $event = \App\Models\Event::find($eventId);

    if (!$event) {
        return false;
    }

    // Check if user is the agency owner
    if ($user->id === $event->agency->owner_id) {
        return true;
    }

    return $event->acceptedStaff
        ->contains('user_id', $user->id);
});
