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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import axios from 'axios';
import {
    CalendarIcon,
    ChevronLeft,
    Clock,
    DollarSign,
    FileText,
    MapPin,
    Shirt,
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

interface EventRequirements {
    clothing_requirements: string;
    special_instructions: string;
    arrival_time: string;
    meeting_point: string;
    equipment_needed: string;
    other_notes: string;
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
    requirements: EventRequirements | null;
    compensation: Compensation | null;
    initial_messages: Message[];
    assignments: Assignment[];
}

export default function EventDetails({
    event,
    agency,
    requirements,
    compensation,
    initial_messages,
    assignments,
}: Props) {
    const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);

    const [messages, setMessages] = useState<Message[]>(initial_messages);
    const [sendMessageLoading, setSendMessageLoading] = useState(false);

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
    const handleUpdateField = (field: string, value: string) => {
        if (!event) return;

        //TODO: handle updates

        console.log('[v0] Updated field:', field, 'to:', value);
    };

    const handleUpdateRequirement = (field: string, value: string) => {
        if (!event || !requirements) return;

        //TOOD: handle updates

        console.log('[v0] Updated requirement:', field, 'to:', value);
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
                            <EditableField
                                value={event.name}
                                onSave={(value) =>
                                    handleUpdateField('name', value)
                                }
                                className="mb-2"
                            />
                            <EditableField
                                value={event.description}
                                onSave={(value) =>
                                    handleUpdateField('description', value)
                                }
                                multiline
                            />
                        </div>
                        <Badge
                            variant="outline"
                            className={`${getStatusColor(event.status)} px-3 py-1 text-sm`}
                        >
                            {event.status}
                        </Badge>
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
                                        <EditableField
                                            value={formatDate(event.date)}
                                            onSave={(value) =>
                                                handleUpdateField('date', value)
                                            }
                                            label="Date"
                                        />
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <EditableField
                                            value={`${event.time_from} - ${event.time_to}`}
                                            onSave={(value) => {
                                                const [start, end] =
                                                    value.split(' - ');
                                                handleUpdateField(
                                                    'startTime',
                                                    start.trim(),
                                                );
                                                handleUpdateField(
                                                    'endTime',
                                                    end.trim(),
                                                );
                                            }}
                                            label="Time"
                                        />
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <EditableField
                                            value={event.location}
                                            onSave={(value) =>
                                                handleUpdateField(
                                                    'location',
                                                    value,
                                                )
                                            }
                                            label="Location"
                                        />
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <EditableField
                                            value={
                                                compensation?.type === 'hourly'
                                                    ? `$${compensation?.amount}/hour`
                                                    : `$${compensation?.amount} fixed`
                                            }
                                            onSave={(value) => {
                                                const amount =
                                                    value.match(/\d+/);
                                                if (amount)
                                                    handleUpdateField(
                                                        'wageAmount',
                                                        amount[0],
                                                    );
                                            }}
                                            label="Wage"
                                        />
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

                        {/* Requirements */}
                        {requirements && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Requirements & Instructions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {requirements.clothing_requirements && (
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Shirt className="h-4 w-4 text-muted-foreground" />
                                                <h4 className="font-semibold text-foreground">
                                                    Dress Code
                                                </h4>
                                            </div>
                                            <div className="pl-6">
                                                <EditableField
                                                    value={
                                                        requirements.clothing_requirements
                                                    }
                                                    onSave={(value) =>
                                                        handleUpdateRequirement(
                                                            'clothing_requirements',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {requirements.special_instructions && (
                                        <div>
                                            <h4 className="mb-2 font-semibold text-foreground">
                                                Instructions
                                            </h4>
                                            <EditableField
                                                value={
                                                    requirements.special_instructions
                                                }
                                                onSave={(value) =>
                                                    handleUpdateRequirement(
                                                        'special_instructions',
                                                        value,
                                                    )
                                                }
                                                multiline
                                            />
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {requirements.arrival_time && (
                                            <div className="flex items-start gap-3">
                                                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                <EditableField
                                                    value={
                                                        requirements.arrival_time
                                                    }
                                                    onSave={(value) =>
                                                        handleUpdateRequirement(
                                                            'arrival_time',
                                                            value,
                                                        )
                                                    }
                                                    label="Check-in Time"
                                                />
                                            </div>
                                        )}
                                        {/* {requirements.parking_info && (
                                            <div className="flex items-start gap-3">
                                                <ParkingCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                <EditableField
                                                    value={
                                                        event.requirements
                                                            .parkingInfo
                                                    }
                                                    onSave={(value) =>
                                                        handleUpdateRequirement(
                                                            'parkingInfo',
                                                            value,
                                                        )
                                                    }
                                                    label="Parking"
                                                />
                                            </div>
                                        )} */}
                                        {/* {requirements.contact_person && (
                                            <div className="flex items-start gap-3">
                                                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                <EditableField
                                                    value={
                                                        event.requirements
                                                            .contactPerson
                                                    }
                                                    onSave={(value) =>
                                                        handleUpdateRequirement(
                                                            'contactPerson',
                                                            value,
                                                        )
                                                    }
                                                    label="Contact Person"
                                                />
                                            </div>
                                        )} */}
                                        {/* {event.requirements.contactPhone && (
                                            <div className="flex items-start gap-3">
                                                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                <EditableField
                                                    value={
                                                        event.requirements
                                                            .contactPhone
                                                    }
                                                    onSave={(value) =>
                                                        handleUpdateRequirement(
                                                            'contactPhone',
                                                            value,
                                                        )
                                                    }
                                                    label="Phone"
                                                />
                                            </div>
                                        )} */}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                onAcceptRequest={() => {}}
                onRejectRequest={() => {}}
                onRemoveStaff={() => {}}
            />
        </AppLayout>
    );
}
