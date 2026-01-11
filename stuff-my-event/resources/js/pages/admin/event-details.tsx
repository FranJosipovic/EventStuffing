import { EditableField } from '@/components/editable-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Building,
    CalendarIcon,
    ChevronLeft,
    Clock,
    DollarSign,
    FileText,
    MapPin,
    Send,
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

interface Message {
    id: string;
    user_id: string;
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
    status: 'pending' | 'accepted' | 'rejected';
    notes: string | null;
    responded_at: string | null;
}

interface Props {
    event: EventDetails;
    agency: Agency;
    requirements: EventRequirements | null;
    compensation: Compensation | null;
    messages: Message[];
    assignments: Assignment[];
}

export default function Events({
    event,
    agency,
    requirements,
    compensation,
    messages,
    assignments,
}: Props) {
    console.log('Event Details:', compensation);
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

    //handle chat
    const [message, setMessage] = useState('');
    const handleSendMessage = () => {
        if (!message.trim() || !event) return;

        const newMessage = {
            id: String(messages.length + 1),
            eventId: event.id,
            senderId: 'admin',
            senderName: 'You',
            senderRole: 'Manager',
            message: message.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessage('');
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
                                        <Building className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <EditableField
                                            value="TechCorp Inc"
                                            onSave={(val) => {}}
                                            // value={event.client}
                                            // onSave={(value) =>
                                            //     handleUpdateField(
                                            //         'client',
                                            //         value,
                                            //     )
                                            // }
                                            label="Client"
                                        />
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                        <EditableField
                                            value={
                                                compensation?.type === 'hourly'
                                                    ? `$${compensation.amount}/hour`
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
                                {/* {assignedStaffDetails.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No staff assigned yet
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {assignedStaffDetails.map((staff) => (
                                            <div
                                                key={staff.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {staff.name
                                                                .split(' ')
                                                                .map(
                                                                    (n) => n[0],
                                                                )
                                                                .join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {staff.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {staff.role}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-foreground">
                                                        ${staff.hourlyRate}/hr
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ⭐ {staff.rating}
                                                    </p>
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
                                </Button> */}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar - Event Chat */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6 flex h-[calc(100vh-120px)] flex-col">
                            <CardHeader className="flex-shrink-0">
                                <CardTitle>Event Chat</CardTitle>
                                <CardDescription>
                                    Communication with team members
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                                <div className="flex-1 space-y-4 overflow-y-auto px-6">
                                    {messages.length === 0 ? (
                                        <p className="py-8 text-center text-sm text-muted-foreground">
                                            No messages yet
                                        </p>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className="space-y-1"
                                            >
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {msg.user_name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {msg.user_role}
                                                    </span>
                                                </div>
                                                <div className="rounded-lg bg-muted/50 p-3">
                                                    <p className="text-sm text-foreground">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {/* {formatTimestamp(
                                                        msg.created_at,
                                                    )} */}
                                                    {msg.created_at_full}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex-shrink-0 border-t p-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Type a message..."
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' &&
                                                    !e.shiftKey
                                                ) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            size="icon"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
