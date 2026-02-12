import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EventChat from '@/components/chat/event-chat';
import { 
    Calendar,
    Clock,
    MapPin,
    Users,
    DollarSign,
    CheckCircle2,
    X,
    AlertCircle,
    Building2,
    ArrowLeft,
    Loader2,
    Send,
    ExternalLink
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useEcho } from '@laravel/echo-react';
import axios from 'axios';

export interface Message {
    id: number;
    user_id: number;
    user_name: string;
    user_role: string;
    message: string;
    created_at: string;
    created_at_full: string;
}

interface Event {
    id: number;
    name: string;
    description: string;
    date: string;
    formatted_date: string;
    time_from: string;
    time_to: string;
    location: string;
    location_latitude?: number;
    location_longitude?: number;
    google_maps_url?: string;
    has_coordinates: boolean;
    required_staff_count: number;
    status: {
        value: string;
        label: string;
        color: string;
    };
    compensation?: {
        hourly_rate: number;
        total_amount: number;
        type: string;
    };
    requirements?: {
        age_minimum?: number;
        experience_years?: number;
        skills_required?: string;
        certifications_required?: string;
        physical_requirements?: string;
    };
    agency: {
        id: number;
        name: string;
    };
    accepted_count: number;
}

interface UserAssignment {
    id: number;
    status: {
        value: string;
        label: string;
        color: string;
    };
    notes?: string;
    responded_at?: string;
    responded_at_human?: string;
}

interface EventDetailsProps {
    event: Event;
    initial_messages: Message[];
    userAssignment: UserAssignment | null;
}

export default function EventDetails({ event, initial_messages = [], userAssignment }: EventDetailsProps) {
    const { flash } = usePage<SharedData>().props;
    const [applying, setApplying] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initial_messages);
    const [sendMessageLoading, setSendMessageLoading] = useState(false);

    // Listen for new messages
    useEcho(`event.${event.id}`, '.message.received', (message) => {
        console.log('New message received:', message);
        setMessages((prevMessages) => [...prevMessages, message]);
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'My Schedule',
            href: '/staff/schedule',
        },
        {
            title: event.name,
            href: `/staff/events/${event.id}`,
        },
    ];

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            const toastId = toast.success(flash.success);
            const timer = setTimeout(() => toast.dismiss(toastId), 5000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            const toastId = toast.error(flash.error);
            const timer = setTimeout(() => toast.dismiss(toastId), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const getStatusColor = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
            yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
            green: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
            red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
            gray: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
        };
        return colors[color] || colors.gray;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (time: string) => {
        const date = new Date(time);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleApply = () => {
        setApplying(true);
        router.post(
            `/staff/events/${event.id}/apply`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setApplying(false),
            }
        );
    };

    const handleCancelApplication = () => {
        setCancelling(true);
        router.delete(
            `/staff/events/${event.id}/cancel-application`,
            {
                preserveScroll: true,
                onFinish: () => setCancelling(false),
            }
        );
    };

    const handleSendMessage = async (
        message: string,
        onMessageSent: () => void,
    ) => {
        if (!message.trim() || !event) return;
        try {
            setSendMessageLoading(true);
            const response = await axios.post(`/events/${event.id}/messages`, {
                message: message,
            });

            console.log('Message sent successfully:', response.data);
            onMessageSent();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendMessageLoading(false);
        }
    };

    const canApply = !userAssignment || userAssignment.status.value === 'rejected';
    const isPending = userAssignment?.status.value === 'pending';
    const isAccepted = userAssignment?.status.value === 'accepted';

    const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${event.name} - Event Details`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Back Button */}
                <Link href="/staff/schedule" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Schedule
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
                            <Badge variant="outline" className={getStatusColor(event.status.color)}>
                                {event.status.label}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{event.agency.name}</span>
                        </div>
                    </div>

                    {/* Assignment Status */}
                    {userAssignment && (
                        <Badge 
                            variant="outline" 
                            className={`${getStatusColor(userAssignment.status.color)} text-lg px-4 py-2`}
                        >
                            {isAccepted && <CheckCircle2 className="h-4 w-4 mr-2" />}
                            {isPending && <Clock className="h-4 w-4 mr-2" />}
                            {userAssignment.status.value === 'rejected' && <X className="h-4 w-4 mr-2" />}
                            {userAssignment.status.label}
                        </Badge>
                    )}
                </div>

                {/* Action Buttons */}
                {!isAccepted && (
                    <div className="flex gap-3">
                        {canApply && (
                            <Button 
                                onClick={handleApply}
                                disabled={applying}
                                size="lg"
                            >
                                {applying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        {userAssignment?.status.value === 'rejected' ? 'Reapply' : 'Apply for Event'}
                                    </>
                                )}
                            </Button>
                        )}
                        {isPending && (
                            <Button 
                                onClick={handleCancelApplication}
                                disabled={cancelling}
                                variant="outline"
                                size="lg"
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel Application
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                            </CardContent>
                        </Card>

                        {/* Event Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Date</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                                            {daysUntil > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Time</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatTime(event.time_from)} - {formatTime(event.time_to)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 md:col-span-2">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-sm text-muted-foreground">{event.location}</p>
                                            {event.location_latitude && event.location_longitude && (
                                                <a 
                                                    href={`https://www.google.com/maps?q=${event.location_latitude},${event.location_longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    Open in Google Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Staff Required</p>
                                            <p className="text-sm text-muted-foreground">
                                                {event.accepted_count} / {event.required_staff_count} accepted
                                            </p>
                                        </div>
                                    </div>

                                    {event.compensation && (
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium">Compensation</p>
                                                <p className="text-sm font-semibold text-green-600">
                                                    ${event.compensation.hourly_rate}/hr
                                                </p>
                                                {event.compensation.total_amount && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Total: ${event.compensation.total_amount}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        {event.requirements && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Requirements</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {event.requirements.age_minimum && (
                                        <div>
                                            <p className="text-sm font-medium">Minimum Age</p>
                                            <p className="text-sm text-muted-foreground">{event.requirements.age_minimum} years</p>
                                        </div>
                                    )}
                                    {event.requirements.experience_years && (
                                        <div>
                                            <p className="text-sm font-medium">Experience Required</p>
                                            <p className="text-sm text-muted-foreground">{event.requirements.experience_years} years</p>
                                        </div>
                                    )}
                                    {event.requirements.skills_required && (
                                        <div>
                                            <p className="text-sm font-medium">Skills Required</p>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.requirements.skills_required}</p>
                                        </div>
                                    )}
                                    {event.requirements.certifications_required && (
                                        <div>
                                            <p className="text-sm font-medium">Certifications Required</p>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.requirements.certifications_required}</p>
                                        </div>
                                    )}
                                    {event.requirements.physical_requirements && (
                                        <div>
                                            <p className="text-sm font-medium">Physical Requirements</p>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.requirements.physical_requirements}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Location Map */}
                        {event.has_coordinates && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Event Location
                                    </CardTitle>
                                    <CardDescription>
                                        {event.location}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            style={{ border: 0 }}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(event.location_longitude) - 0.01},${Number(event.location_latitude) - 0.01},${Number(event.location_longitude) + 0.01},${Number(event.location_latitude) + 0.01}&layer=mapnik&marker=${event.location_latitude},${event.location_longitude}`}
                                            allowFullScreen
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full bg-transparent"
                                        asChild
                                    >
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${event.location_latitude},${event.location_longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open in Google Maps
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        
                        {/* Your Status */}
                        {userAssignment && (
                            <Card className={
                                isAccepted ? 'border-green-200 dark:border-green-800' :
                                isPending ? 'border-yellow-200 dark:border-yellow-800' :
                                'border-red-200 dark:border-red-800'
                            }>
                                <CardHeader>
                                    <CardTitle className="text-lg">Your Application Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <Badge variant="outline" className={getStatusColor(userAssignment.status.color)}>
                                            {userAssignment.status.label}
                                        </Badge>
                                    </div>
                                    {userAssignment.responded_at_human && (
                                        <div>
                                            <span className="text-sm text-muted-foreground">Responded {userAssignment.responded_at_human}</span>
                                        </div>
                                    )}
                                    {userAssignment.notes && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm font-medium mb-1">Notes</p>
                                            <p className="text-sm text-muted-foreground italic">{userAssignment.notes}</p>
                                        </div>
                                    )}
                                    
                                    {isPending && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                                <p className="text-xs text-muted-foreground">
                                                    Your application is pending review by the agency owner.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Chat */}
                        {isAccepted && (
                            <EventChat
                                messages={messages}
                                loading={sendMessageLoading}
                                handleSendMessage={handleSendMessage}
                            />
                        )}

                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Agency</p>
                                    <p className="font-medium">{event.agency.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Event Status</p>
                                    <Badge variant="outline" className={getStatusColor(event.status.color)}>
                                        {event.status.label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Staffing Progress</p>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>{event.accepted_count} / {event.required_staff_count}</span>
                                            <span>{Math.round((event.accepted_count / event.required_staff_count) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div 
                                                className="bg-green-500 h-2 rounded-full transition-all"
                                                style={{ 
                                                    width: `${Math.min((event.accepted_count / event.required_staff_count) * 100, 100)}%` 
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
