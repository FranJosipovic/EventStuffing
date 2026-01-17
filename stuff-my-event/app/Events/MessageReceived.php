<?php

namespace App\Events;

use App\Models\Event;
use App\Models\EventMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // /**
    //  * Create a new event instance.
    //  */
    public function __construct(
        public EventMessage $message,
    ) {}
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): Channel
    {
        return new PrivateChannel('event.' . $this->message->event_id);
    }

    public function broadcastAs(): string
    {
        return 'message.received';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'event_id' => $this->message->event_id,
            'user_id' => $this->message->user_id,
            'user_name' => $this->message->user->name,
            'user_role' => $this->message->user->role->value,
            'message' => $this->message->message,
            'created_at' => $this->message->created_at->diffForHumans(),
            'created_at_full' => $this->message->created_at->format('M d, Y H:i'),
        ];
    }
}
