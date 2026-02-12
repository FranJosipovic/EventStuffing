import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    DollarSign, 
    Users, 
    Calendar, 
    TrendingUp,
    CheckCircle,
    FileText,
    User
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/admin/reports',
    },
];

interface RecentEvent {
    event_id: number;
    event_name: string;
    event_date: string;
    status: string;
}

interface StaffMember {
    id: number;
    name: string;
    email: string;
    total_assignments: number;
    accepted_assignments: number;
    total_earnings: number;
    recent_events: RecentEvent[];
}

interface StaffPayment {
    user_id: number;
    user_name: string;
    total_paid: number;
    payment_count: number;
    last_paid_at: string;
}

interface EventHistory {
    id: number;
    name: string;
    date: string;
    formatted_date: string;
    location: string;
    status: {
        value: string;
        label: string;
        color: string;
    };
    total_paid: number;
    staff_count: number;
    staff_payments: StaffPayment[];
}

interface OverallStats {
    total_staff: number;
    total_events: number;
    completed_events: number;
    total_paid: number;
    active_staff: number;
}

interface ReportsProps {
    staffMembers: StaffMember[];
    eventHistory: EventHistory[];
    overallStats: OverallStats;
}

export default function ReportsIndex({ staffMembers, eventHistory, overallStats }: ReportsProps) {
    const getStatusColor = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        };
        return colors[color] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports & Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground mt-2">
                            Staff performance, event history, and payment records
                        </p>
                    </div>
                    <FileText className="h-8 w-8 text-primary" />
                </div>

                {/* Overall Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overallStats.total_staff}</div>
                            <p className="text-xs text-muted-foreground">
                                {overallStats.active_staff} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overallStats.total_events}</div>
                            <p className="text-xs text-muted-foreground">
                                {overallStats.completed_events} completed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overallStats.completed_events}</div>
                            <p className="text-xs text-muted-foreground">
                                {overallStats.total_events > 0 
                                    ? Math.round((overallStats.completed_events / overallStats.total_events) * 100)
                                    : 0}% completion rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                €{overallStats.total_paid.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time earnings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Avg per Event</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                €{overallStats.completed_events > 0 
                                    ? (overallStats.total_paid / overallStats.completed_events).toFixed(2)
                                    : '0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per completed event
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for Staff and Events */}
                <Tabs defaultValue="staff" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="staff">Staff Performance</TabsTrigger>
                        <TabsTrigger value="events">Event History</TabsTrigger>
                    </TabsList>

                    {/* Staff Performance Tab */}
                    <TabsContent value="staff" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Staff Members</CardTitle>
                                <CardDescription>
                                    Performance and participation history for each staff member
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {staffMembers.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        No staff members found
                                    </p>
                                ) : (
                                    <div className="space-y-6">
                                        {staffMembers.map(staff => (
                                            <div key={staff.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{staff.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-green-600">
                                                            €{staff.total_earnings.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Total earnings</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="text-center p-3 bg-muted rounded-lg">
                                                        <p className="text-2xl font-bold">{staff.total_assignments}</p>
                                                        <p className="text-xs text-muted-foreground">Total Requests</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-muted rounded-lg">
                                                        <p className="text-2xl font-bold text-green-600">{staff.accepted_assignments}</p>
                                                        <p className="text-xs text-muted-foreground">Accepted</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-muted rounded-lg">
                                                        <p className="text-2xl font-bold">
                                                            {staff.total_assignments > 0 
                                                                ? Math.round((staff.accepted_assignments / staff.total_assignments) * 100)
                                                                : 0}%
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Success Rate</p>
                                                    </div>
                                                </div>

                                                {staff.recent_events.length > 0 && (
                                                    <div>
                                                        <h4 className="font-medium mb-2 text-sm">Recent Events</h4>
                                                        <div className="space-y-2">
                                                            {staff.recent_events.map((event, idx) => (
                                                                <div key={idx} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                                                    <span className="font-medium">{event.event_name}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-muted-foreground">{event.event_date}</span>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {event.status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Event History Tab */}
                    <TabsContent value="events" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Payment History</CardTitle>
                                <CardDescription>
                                    Complete payment records for all completed events
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {eventHistory.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        No payment history available
                                    </p>
                                ) : (
                                    <div className="space-y-6">
                                        {eventHistory.map(event => (
                                            <div key={event.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-lg">{event.name}</h3>
                                                            <Badge variant="outline" className={getStatusColor(event.status.color)}>
                                                                {event.status.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{event.formatted_date}</p>
                                                        <p className="text-sm text-muted-foreground">{event.location}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-green-600">
                                                            €{event.total_paid.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{event.staff_count} staff members</p>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b bg-muted/50">
                                                                <th className="text-left p-3 font-medium">Staff Member</th>
                                                                <th className="text-center p-3 font-medium">Payments</th>
                                                                <th className="text-right p-3 font-medium">Total Paid</th>
                                                                <th className="text-right p-3 font-medium">Last Payment</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {event.staff_payments.map(payment => (
                                                                <tr key={payment.user_id} className="border-b last:border-0">
                                                                    <td className="p-3 font-medium">{payment.user_name}</td>
                                                                    <td className="p-3 text-center">
                                                                        <Badge variant="outline">{payment.payment_count}×</Badge>
                                                                    </td>
                                                                    <td className="p-3 text-right font-semibold text-green-600">
                                                                        €{payment.total_paid.toFixed(2)}
                                                                    </td>
                                                                    <td className="p-3 text-right text-sm text-muted-foreground">
                                                                        {payment.last_paid_at}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
