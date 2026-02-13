import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Banknote, Calendar, Clock, DollarSign, MapPin } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile',
        href: '/staff/profile',
    },
];

interface PastEvent {
    id: number;
    event_id: number;
    event_name: string;
    event_date: string;
    event_time_from: string;
    event_time_to: string;
    event_location: string;
    agency_name?: string;
    compensation?: {
        hourly_rate: number;
        total_amount: number;
    };
}

interface Payment {
    id: number;
    event_id: number;
    event_name?: string;
    hours_worked: number;
    hourly_rate: number;
    amount: number;
    paid_at?: string;
    paid_at_human?: string;
    notes?: string;
}

interface Stats {
    total_earnings: number;
    pending_payments: number;
    total_events_worked: number;
}

interface ProfileProps {
    pastEvents: PastEvent[];
    payments: Payment[];
    stats: Stats;
}

export default function Profile({ pastEvents, payments, stats }: ProfileProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Earnings
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.total_earnings)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Paid to date
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Payments
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {formatCurrency(stats.pending_payments)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting payment
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Events Worked
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_events_worked}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Completed events
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Past Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Past Events</CardTitle>
                            <CardDescription>
                                Events you've worked on
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pastEvents.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No past events yet
                                </div>
                            ) : (
                                <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
                                    {pastEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <Link
                                                    href={`/staff/events/${event.event_id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {event.event_name}
                                                </Link>
                                                {event.compensation && (
                                                    <Badge variant="secondary">
                                                        {formatCurrency(
                                                            event.compensation
                                                                .hourly_rate,
                                                        )}
                                                        /hr
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatDate(
                                                        event.event_date,
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatTime(
                                                        event.event_time_from,
                                                    )}{' '}
                                                    -{' '}
                                                    {formatTime(
                                                        event.event_time_to,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate">
                                                    {event.event_location}
                                                </span>
                                            </div>
                                            {event.agency_name && (
                                                <div className="text-xs text-muted-foreground">
                                                    Agency: {event.agency_name}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>
                                Your earnings and payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {payments.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No payments yet
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Event</TableHead>
                                                <TableHead className="text-right">
                                                    Hours
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Rate
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Amount
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="font-medium">
                                                        {payment.event_name ||
                                                            'Unknown Event'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {payment.hours_worked}h
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            payment.hourly_rate,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            payment.amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.paid_at ? (
                                                            <Badge
                                                                variant="default"
                                                                className="bg-green-600"
                                                            >
                                                                Paid
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
