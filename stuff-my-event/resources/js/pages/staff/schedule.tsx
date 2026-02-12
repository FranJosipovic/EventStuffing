import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    DollarSign,
    Building2
} from 'lucide-react';
import { useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Schedule',
        href: '/staff/schedule',
    },
];

interface Event {
    id: number;
    assignment_id: number;
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
    compensation?: {
        hourly_rate: number;
        total_amount: number;
    };
    agency_name: string;
    assignment_notes?: string;
}

interface Agency {
    id: number;
    name: string;
    owner: {
        name: string;
        email: string;
    };
}

interface ScheduleProps {
    events: Event[];
    currentYear: number;
    currentMonth: number;
    agency: Agency | null;
}

export default function Schedule({ 
    events = [], 
    currentYear,
    currentMonth,
    agency 
}: ScheduleProps) {
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth - 1); // 0-based

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const formatTime = (time: string) => {
        const date = new Date(time);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
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

    // Get calendar data for specific month
    const getCalendarData = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return {
            daysInMonth,
            startingDayOfWeek,
            year,
            month
        };
    };

    // Get events for specific date
    const getEventsForDate = (year: number, month: number, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(event => event.date === dateStr);
    };

    const handlePreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const handleToday = () => {
        const today = new Date();
        setSelectedYear(today.getFullYear());
        setSelectedMonth(today.getMonth());
    };

    const renderCalendar = (year: number, month: number) => {
        const { daysInMonth, startingDayOfWeek } = getCalendarData(year, month);
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
        const todayDate = today.getDate();

        const days = [];
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(
                <div key={`empty-${i}`} className="min-h-[100px] border border-border/50 bg-muted/20" />
            );
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDate(year, month, day);
            const isToday = isCurrentMonth && day === todayDate;

            days.push(
                <div
                    key={day}
                    className={`min-h-[100px] border border-border p-2 hover:bg-accent/50 transition-colors ${
                        isToday ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800' : 'bg-card'
                    }`}
                >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {day}
                        {isToday && <span className="ml-1 text-xs">(Today)</span>}
                    </div>
                    <div className="space-y-1">
                        {dayEvents.map((event) => (
                            <TooltipProvider key={event.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={`/staff/events/${event.id}`}
                                            className="block text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer border border-primary/20 transition-colors"
                                        >
                                            <div className="font-medium truncate">{event.name}</div>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent className="w-80 p-4" side="right">
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-semibold text-base mb-1">{event.name}</h4>
                                                <Badge variant="outline" className={getStatusColor(event.status.color)}>
                                                    {event.status.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{event.description}</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span>{formatTime(event.time_from)} - {formatTime(event.time_to)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span>{event.agency_name}</span>
                                                </div>
                                                {event.compensation && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium">${event.compensation.hourly_rate}/hr</span>
                                                    </div>
                                                )}
                                            </div>
                                            {event.assignment_notes && (
                                                <div className="text-xs text-muted-foreground italic pt-2 border-t">
                                                    Note: {event.assignment_notes}
                                                </div>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Schedule" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
                        <p className="text-muted-foreground">View your assigned events across the year</p>
                    </div>
                    <Button onClick={handleToday} variant="outline">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Today
                    </Button>
                </div>

                {/* Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePreviousMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <CardTitle className="text-2xl">
                                {monthNames[selectedMonth]} {selectedYear}
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleNextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-0">
                            {/* Day headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div
                                    key={day}
                                    className="p-2 text-center font-semibold text-sm border border-border bg-muted"
                                >
                                    {day}
                                </div>
                            ))}
                            {/* Calendar days */}
                            {renderCalendar(selectedYear, selectedMonth)}
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{events.length}</div>
                            <p className="text-xs text-muted-foreground">Assigned events in {selectedYear}</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {events.filter(e => {
                                    const eventDate = new Date(e.date);
                                    return eventDate.getFullYear() === selectedYear && eventDate.getMonth() === selectedMonth;
                                }).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Events in {monthNames[selectedMonth]}</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {events.filter(e => new Date(e.date) >= new Date()).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Future events</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
