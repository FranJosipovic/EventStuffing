import {
    AssignedStaff,
    StaffAssignmentDialog,
    StaffRequest,
} from '@/components/assignements/staff-assignment-dialog';
import EventChat from '@/components/chat/event-chat';
import { EditableField } from '@/components/editable-field';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import axios from 'axios';
import {
    CalendarIcon,
    ChevronLeft,
    Clock,
    DollarSign,
    MapPin,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface EventDetails {
    id: string;
    name: string;
    description: string;
    date: string;
    formatted_date: string;
    time_from: string;
    time_to: string;
    time_range: string;
    location: string;
    location_latitude: number;
    location_longitude: number;
    has_coordinates: boolean;
    status: 'new' | 'staffing' | 'ready' | 'completed';
    status_label: string;
    status_color: string;
    required_staff_count: number;
    accepted_staff_count: number;
    created_at: string;
}

interface Agency {
    id: string;
    name: string;
}

interface Compensation {
    type: 'fixed' | 'hourly';
    amount: number;
    formatted_amount: string;
    notes: string;
}

export interface Message {
    id: number;
    user_id: number;
    user_name: string;
    user_role: string;
    message: string;
    created_at: string;
    created_at_full: string;
}

interface Assignment {
    id: string;
    user_id: string;
    user_name: string;
    user_role: string;
    status: 'pending' | 'accepted' | 'rejected';
    notes: string | null;
    responded_at: string | null;
}

interface Props {
    event: EventDetails;
    agency: Agency;
    compensation: Compensation | null;
    initial_messages: Message[];
    assignments: Assignment[];
}

export default function EventDetails({
    event,
    agency,
    compensation,
    initial_messages,
    assignments,
}: Props) {
    const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);

    const [messages, setMessages] = useState<Message[]>(initial_messages);
    const [sendMessageLoading, setSendMessageLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isWageEditing, setIsWageEditing] = useState(false);
    const [wageAmount, setWageAmount] = useState(compensation?.amount ?? 0);
    const [wageType, setWageType] = useState<'hourly' | 'fixed'>(
        compensation?.type ?? 'hourly',
    );
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        event.date ? new Date(event.date) : undefined,
    );
    const [isDateOpen, setIsDateOpen] = useState(false);

    const handleDeleteEvent = () => {
        setIsDeleting(true);
        router.delete(`/admin/events/${event.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setIsDeleteDialogOpen(false);
            },
        });
    };

    useEcho(`event.${event.id}`, '.message.received', (message) => {
        console.log('New message received:', message);
        setMessages((prevMessages) => [...prevMessages, message]);
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Events',
            href: '/admin/events',
        },
        {
            title: event.name,
            href: `/admin/events/${event.id}`,
        },
    ];

    //helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'staffing':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'ready':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'completed':
                return 'bg-muted text-muted-foreground border-border';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
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

    //event updates
    const handleUpdateDate = (date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        setIsDateOpen(false);
        router.put(
            `/admin/events/${event.id}`,
            {
                date: date.toISOString().split('T')[0],
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleUpdateField = async (field: string, value: string) => {
        if (!event) return;

        try {
            const data: Record<string, any> = {};

            if (field === 'time') {
                const [start, end] = value.split(' - ');
                data.time_from = start.trim();
                data.time_to = end.trim();
            }

            router.put(`/admin/events/${event.id}`, data, {
                preserveScroll: true,
            });
        } catch (error) {
            console.error('Error updating field:', error);
        }
    };

    const handleSaveWage = () => {
        router.put(
            `/admin/events/${event.id}`,
            {
                wage_amount: wageAmount,
                wage_type: wageType,
            },
            {
                preserveScroll: true,
                onSuccess: () => setIsWageEditing(false),
            },
        );
    };

    const staffingPercentage =
        event.accepted_staff_count > 0
            ? (event.accepted_staff_count / event.required_staff_count) * 100
            : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.name} />
            <main className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/admin/events">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Back to Events
                        </Button>
                    </Link>
                    <div className="flex items-start justify-between">
                        <div className="mr-4 flex-1">
                            <h1 className="mb-2 text-2xl font-bold">
                                {event.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {event.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`${getStatusColor(event.status)} px-3 py-1 text-sm`}
                            >
                                {event.status}
                            </Badge>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content - Left Side */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Event Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <CalendarIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Date
                                            </p>
                                            <Popover
                                                open={isDateOpen}
                                                onOpenChange={setIsDateOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-auto p-0 font-medium text-foreground hover:underline"
                                                    >
                                                        {formatDate(event.date)}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={
                                                            handleUpdateDate
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <EditableField
                                            value={`${event.time_from} - ${event.time_to}`}
                                            onSave={(value) =>
                                                handleUpdateField('time', value)
                                            }
                                            label="Time"
                                        />
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Location
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {event.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Wage
                                            </p>
                                            {isWageEditing ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            value={wageAmount}
                                                            onChange={(e) =>
                                                                setWageAmount(
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="h-8 w-24"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                        <Select
                                                            value={wageType}
                                                            onValueChange={(
                                                                v:
                                                                    | 'hourly'
                                                                    | 'fixed',
                                                            ) => setWageType(v)}
                                                        >
                                                            <SelectTrigger className="h-8 w-28">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="hourly">
                                                                    Per Hour
                                                                </SelectItem>
                                                                <SelectItem value="fixed">
                                                                    Fixed
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={
                                                                handleSaveWage
                                                            }
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsWageEditing(
                                                                    false,
                                                                );
                                                                setWageAmount(
                                                                    compensation?.amount ??
                                                                        0,
                                                                );
                                                                setWageType(
                                                                    compensation?.type ??
                                                                        'hourly',
                                                                );
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p
                                                    className="cursor-pointer font-medium text-foreground hover:underline"
                                                    onClick={() =>
                                                        setIsWageEditing(true)
                                                    }
                                                >
                                                    {compensation?.type ===
                                                    'hourly'
                                                        ? `$${compensation?.amount}/hour`
                                                        : `$${compensation?.amount ?? 0} fixed`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Staffing Progress
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {event.accepted_staff_count} /
                                                {event.required_staff_count}{' '}
                                                staff
                                            </p>
                                            <Progress
                                                value={staffingPercentage}
                                                className="mt-2 h-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Map */}
                        {event.has_coordinates && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Location
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

                        {/* Assigned Staff */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Assigned Staff ({event.accepted_staff_count}
                                    )
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                Staff assignment part
                                {assignments.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No staff assigned yet
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {assignments
                                            .filter(
                                                (a) => a.status === 'accepted',
                                            )
                                            .map((staff) => (
                                                <div
                                                    key={staff.id}
                                                    className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarFallback>
                                                                {staff.user_name
                                                                    .split(' ')
                                                                    .map(
                                                                        (n) =>
                                                                            n[0],
                                                                    )
                                                                    .join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    staff.user_name
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    staff.user_role
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                                <Button
                                    variant="outline"
                                    className="mt-4 w-full bg-transparent"
                                    onClick={() => setIsStaffDialogOpen(true)}
                                >
                                    Manage Staff Assignment
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar - Event Chat */}
                    <div className="lg:col-span-1">
                        <EventChat
                            messages={messages}
                            loading={sendMessageLoading}
                            handleSendMessage={handleSendMessage}
                        />
                    </div>
                </div>
            </main>

            <StaffAssignmentDialog
                open={isStaffDialogOpen}
                onOpenChange={setIsStaffDialogOpen}
                assignedStaff={assignments
                    .filter((a) => a.status === 'accepted')
                    .map((a) => a as AssignedStaff)}
                staffRequests={assignments
                    .filter((a) => a.status === 'pending')
                    .map((a) => a as StaffRequest)}
                onAcceptRequest={(requestId) => {
                    router.post(
                        `/admin/assignments/${requestId}/approve`,
                        {},
                        {
                            preserveScroll: true,
                        },
                    );
                }}
                onRejectRequest={(requestId) => {
                    router.post(
                        `/admin/assignments/${requestId}/reject`,
                        {},
                        {
                            preserveScroll: true,
                        },
                    );
                }}
                onRemoveStaff={(staffId) => {
                    router.delete(`/admin/assignments/${staffId}`, {
                        preserveScroll: true,
                    });
                }}
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Event"
                description={`Are you sure you want to delete "${event.name}"? This action cannot be undone and will remove all associated data including assignments, messages, and payments.`}
                confirmLabel="Delete Event"
                variant="destructive"
                loading={isDeleting}
                onConfirm={handleDeleteEvent}
            />
        </AppLayout>
    );
}
