import { Message } from '@/pages/admin/event-details';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';

interface Props {
    messages: Message[];
    loading: boolean;
    handleSendMessage: (message: string, onMessageSent: () => void) => void;
}

export default function EventChat({
    messages,
    loading,
    handleSendMessage,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const [message, setMessage] = useState('');
    return (
        <Card className="sticky top-6 flex h-[calc(100vh-120px)] flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Event Chat</CardTitle>
                <CardDescription>
                    Communication with team members
                </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                    {messages.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No messages yet
                        </p>
                    ) : (
                        messages.map((msg) => {
                            const isCurrentUser = msg.user_id === auth.user.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                                >
                                    {!isCurrentUser && (
                                        <span className="mb-1 px-1 text-xs text-muted-foreground">
                                            {msg.user_name}
                                        </span>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                            isCurrentUser
                                                ? 'rounded-br-md bg-blue-600 text-white'
                                                : 'rounded-bl-md bg-muted text-foreground'
                                        }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                    </div>
                                    <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                                        {msg.created_at}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="flex-shrink-0 border-t p-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(message, () =>
                                        setMessage(''),
                                    );
                                }
                            }}
                        />
                        <Button
                            onClick={() =>
                                handleSendMessage(message, () => setMessage(''))
                            }
                            size="icon"
                        >
                            {loading ? (
                                <Spinner />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
