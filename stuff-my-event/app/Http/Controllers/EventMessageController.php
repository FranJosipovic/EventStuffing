<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\EventMessage;
use App\Events\MessageReceived;
use Illuminate\Http\JsonResponse;

class EventMessageController extends Controller
{
    public function store(Request $request, Event $event): JsonResponse
    {
        // Check authorization
        $user = auth()->guard()->user();
        if ($event->agency_id !== $user->agency_id) {
            abort(403, 'Unauthorized access to this event.');
        }

        // Validate
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        // Create message
        $message = EventMessage::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
        ]);

        // Broadcast the event
        MessageReceived::dispatch($message->load('user'));

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
        ]);
    }
}
