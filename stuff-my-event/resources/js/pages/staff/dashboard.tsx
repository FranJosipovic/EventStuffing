import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CalendarClock,
    CheckCircle2,
    Clock,
    DollarSign,
    Loader2,
    MapPin,
    Send,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff Dashboard',
        href: dashboard().url,
    },
];

interface ActivityItem {
    id: number;
    event_id: number;
    event_name: string;
    event_description: string;
    event_date: string;
    event_time_from: string;
    event_time_to: string;
    event_location: string;
    event_status: {
        value: string;
        label: string;
        color: string;
    };
    assignment_status: {
        value: string;
        label: string;
        color: string;
    };
    compensation?: {
        hourly_rate: number;
        total_amount: number;
    };
    agency_name: string;
    assignment_notes?: string;
    applied_at: string;
    applied_at_human: string;
    responded_at?: string;
    responded_at_human?: string;
    days_until: number;
    is_upcoming: boolean;
}

interface Project {
    id: number;
    name: string;
    description: string;
    date: string;
    time_from: string;
    time_to: string;
    location: string;
    status: {
        value: string;
        label: string;
        color: string;
    };
    required_staff_count?: number;
    accepted_count?: number;
    spots_remaining?: number;
    compensation?: {
        hourly_rate: number;
        total_amount: number;
    };
    days_until: number;
    agency_name?: string;
    assignment_notes?: string;
    user_assignment_status?: string;
    can_apply?: boolean;
}

interface Agency {
    id: number;
    name: string;
    owner: {
        name: string;
        email: string;
    };
}

interface DashboardProps {
    activityHistory: ActivityItem[];
    availableEvents: Project[];
    agency: Agency | null;
}

export default function Dashboard({
    activityHistory = [],
    availableEvents = [],
    agency,
}: DashboardProps) {
    const { flash } = usePage<SharedData>().props;
    const [applyingEventId, setApplyingEventId] = useState<number | null>(null);
    const [cancellingEventId, setCancellingEventId] = useState<number | null>(
        null,
    );

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

    const handleApply = (eventId: number) => {
        setApplyingEventId(eventId);
        router.post(
            `/staff/events/${eventId}/apply`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setApplyingEventId(null),
            },
        );
    };

    const handleCancelApplication = (eventId: number) => {
        setCancellingEventId(eventId);
        router.delete(`/staff/events/${eventId}/cancel-application`, {
            preserveScroll: true,
            onFinish: () => setCancellingEventId(null),
        });
    };

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
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (time: string) => {
        const date = new Date(time);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDaysUntil = (daysUntil: number) => {
        if (daysUntil === 0) return 'Today!';
        if (daysUntil === 1) return 'Tomorrow';
        if (daysUntil < 0) return 'Past';

        const days = Math.floor(daysUntil);
        if (days === 0) {
            return 'Today';
        }

        return `In ${days} ${days === 1 ? 'day' : 'days'}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Welcome Section */}
                {agency && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome to {agency.name}</CardTitle>
                            <CardDescription>
                                Agency managed by {agency.owner.name}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {/* Activity History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            My Activity History
                        </CardTitle>
                        <CardDescription>
                            All your assignment history and applications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activityHistory.length === 0 ? (
                            <div className="py-12 text-center">
                                <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    You don't have any activity yet
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Check available events below to apply
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activityHistory.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className={`space-y-3 rounded-lg border p-4 ${
                                            activity.assignment_status.value ===
                                            'accepted'
                                                ? 'border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/10'
                                                : activity.assignment_status
                                                        .value === 'pending'
                                                  ? 'border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10'
                                                  : 'border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <Link
                                                        href={`/staff/events/${activity.event_id}`}
                                                        className="font-semibold hover:underline"
                                                    >
                                                        {activity.event_name}
                                                    </Link>
                                                    <Badge
                                                        variant="outline"
                                                        className={getStatusColor(
                                                            activity
                                                                .assignment_status
                                                                .color,
                                                        )}
                                                    >
                                                        {
                                                            activity
                                                                .assignment_status
                                                                .label
                                                        }
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    Applied{' '}
                                                    {activity.applied_at_human}
                                                    {activity.responded_at_human &&
                                                        ` • Responded ${activity.responded_at_human}`}
                                                </span>
                                            </div>
                                            {activity.assignment_status
                                                .value === 'accepted' ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : activity.assignment_status
                                                  .value === 'pending' ? (
                                                <Clock className="h-5 w-5 text-yellow-500" />
                                            ) : (
                                                <X className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>

                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {activity.event_description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {formatDate(
                                                        activity.event_date,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatTime(
                                                        activity.event_time_from,
                                                    )}{' '}
                                                    -{' '}
                                                    {formatTime(
                                                        activity.event_time_to,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="col-span-2 flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">
                                                    {activity.event_location}
                                                </span>
                                            </div>
                                        </div>

                                        {activity.compensation && (
                                            <div className="border-t pt-2">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium">
                                                        $
                                                        {
                                                            activity
                                                                .compensation
                                                                .hourly_rate
                                                        }
                                                        /hr
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {activity.is_upcoming &&
                                            activity.assignment_status.value ===
                                                'accepted' && (
                                                <div className="pt-2">
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                                            activity.days_until <=
                                                            3
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                                : activity.days_until <=
                                                                    7
                                                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                        }`}
                                                    >
                                                        {formatDaysUntil(
                                                            activity.days_until,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                        {activity.assignment_notes && (
                                            <div className="border-t pt-2 text-xs text-muted-foreground italic">
                                                Note:{' '}
                                                {activity.assignment_notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Available Events */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarClock className="h-5 w-5" />
                            Available Events
                        </CardTitle>
                        <CardDescription>
                            Events you can apply for
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {availableEvents.length === 0 ? (
                            <div className="py-12 text-center">
                                <CalendarClock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    No available events at the moment
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Check back later for new opportunities
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {availableEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`space-y-3 rounded-lg border p-4 transition-shadow hover:shadow-md ${
                                            event.user_assignment_status ===
                                            'pending'
                                                ? 'border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10'
                                                : event.user_assignment_status ===
                                                    'rejected'
                                                  ? 'border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10'
                                                  : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <Link
                                                    href={`/staff/events/${event.id}`}
                                                    className="block font-semibold hover:underline"
                                                >
                                                    {event.name}
                                                </Link>
                                                <Badge
                                                    variant="outline"
                                                    className={`mt-1 ${getStatusColor(event.status.color)}`}
                                                >
                                                    {event.status.label}
                                                </Badge>
                                            </div>
                                            {event.user_assignment_status ===
                                                'pending' && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                                >
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    Pending
                                                </Badge>
                                            )}
                                            {event.user_assignment_status ===
                                                'rejected' && (
                                                <Badge
                                                    variant="outline"
                                                    className="border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
                                                >
                                                    <X className="mr-1 h-3 w-3" />
                                                    Rejected
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {event.description}
                                        </p>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {formatDate(event.date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {formatTime(
                                                        event.time_from,
                                                    )}{' '}
                                                    -{' '}
                                                    {formatTime(event.time_to)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">
                                                    {event.location}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 border-t pt-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Spots Available
                                                </span>
                                                <span className="font-medium">
                                                    {event.spots_remaining}/
                                                    {event.required_staff_count}
                                                </span>
                                            </div>

                                            {event.compensation && (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium">
                                                        $
                                                        {
                                                            event.compensation
                                                                .hourly_rate
                                                        }
                                                        /hr
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {event.days_until >= 0 && (
                                            <div className="pt-2">
                                                <span
                                                    className={`rounded px-2 py-1 text-xs font-medium ${
                                                        event.days_until <= 3
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                            : event.days_until <=
                                                                7
                                                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                              : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                    }`}
                                                >
                                                    {formatDaysUntil(
                                                        event.days_until,
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            {event.can_apply ? (
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() =>
                                                        handleApply(event.id)
                                                    }
                                                    disabled={
                                                        applyingEventId ===
                                                        event.id
                                                    }
                                                >
                                                    {applyingEventId ===
                                                    event.id ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                            Applying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="mr-2 h-3 w-3" />
                                                            Apply for Event
                                                        </>
                                                    )}
                                                </Button>
                                            ) : event.user_assignment_status ===
                                              'pending' ? (
                                                <div className="space-y-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400"
                                                        disabled
                                                    >
                                                        <Clock className="mr-2 h-3 w-3" />
                                                        Application Pending
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="w-full text-xs"
                                                        onClick={() =>
                                                            handleCancelApplication(
                                                                event.id,
                                                            )
                                                        }
                                                        disabled={
                                                            cancellingEventId ===
                                                            event.id
                                                        }
                                                    >
                                                        {cancellingEventId ===
                                                        event.id ? (
                                                            <>
                                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                                Cancelling...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X className="mr-1 h-3 w-3" />
                                                                Cancel
                                                                Application
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : event.user_assignment_status ===
                                              'rejected' ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() =>
                                                        handleApply(event.id)
                                                    }
                                                    disabled={
                                                        applyingEventId ===
                                                        event.id
                                                    }
                                                >
                                                    {applyingEventId ===
                                                    event.id ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                            Reapplying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="mr-2 h-3 w-3" />
                                                            Reapply
                                                        </>
                                                    )}
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full"
                                                    disabled
                                                >
                                                    <CheckCircle2 className="mr-2 h-3 w-3" />
                                                    Already Accepted
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
