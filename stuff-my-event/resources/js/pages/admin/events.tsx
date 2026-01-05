import { CreateEventDialog } from '@/components/events/create-event-dialog';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CalendarIcon, Clock, MapPin, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    formatted_date: string;
    time_from: string;
    time_to: string;
    time_range: string;
    location: string;
    status: 'new' | 'staffing' | 'ready' | 'completed';
    status_label: string;
    status_color: string;
    required_staff_count: number;
}

interface Props {
    events: Event[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/events',
    },
];

export default function Events({ events }: Props) {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) {
            const toastId = toast.success(flash.success);
            const timer = setTimeout(() => toast.dismiss(toastId), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const eventsThisWeek = events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length;

    const eventsThisMonth = events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
    }).length;

    const eventsMissingStaffing = events.filter(
        (event) => event.status === 'new' || event.status === 'staffing',
    ).length;

    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            searchQuery === '' ||
            event.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || event.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Events
                        </h1>
                        <p className="text-muted-foreground">
                            Manage all your events in one place
                        </p>
                    </div>
                    <CreateEventDialog />
                </div>

                {/* Stats */}
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                This Week
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {eventsThisWeek}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Upcoming events
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {eventsThisMonth}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total events
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Missing Staffing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {eventsMissingStaffing}
                            </div>
                            <p className="text-xs text-destructive">
                                Requires attention
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="relative min-w-[300px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search events by name or client..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="staffing">
                                        Staffing
                                    </SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Events Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-foreground">
                            All Events
                        </CardTitle>
                        <CardDescription>
                            {filteredEvents.length} event
                            {filteredEvents.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Staffing</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No events found. Try adjusting your
                                            filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEvents.map((event) => {
                                        const staffingPercentage =
                                            event.required_staff_count > 0
                                                ? ((event.required_staff_count -
                                                      event.required_staff_count /
                                                          2) /
                                                      event.required_staff_count) *
                                                  100
                                                : 0;

                                        return (
                                            <TableRow key={event.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {event.name}
                                                        </div>
                                                        {/* <div className="text-sm text-muted-foreground">{event.client}</div> */}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-foreground">
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {
                                                                event.formatted_date
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            {event.time_range}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-foreground">
                                                            {event.location}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="flex items-center gap-1 text-foreground">
                                                                <Users className="h-4 w-4" />
                                                                {event.required_staff_count -
                                                                    event.required_staff_count /
                                                                        2}
                                                                /
                                                                {
                                                                    event.required_staff_count
                                                                }
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {Math.round(
                                                                    staffingPercentage,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={
                                                                staffingPercentage
                                                            }
                                                            className="h-2"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={getStatusColor(
                                                            event.status,
                                                        )}
                                                    >
                                                        {event.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
