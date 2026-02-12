import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    TrendingUp, 
    CheckCircle, 
    XCircle,
    MessageSquare,
    UserCheck,
    Activity,
    Briefcase,
    CalendarClock,
    AlertCircle,
    Mail,
    User,
    Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Agency Dashboard',
        href: '/dashboard',
    },
];

interface Activity {
    id: string;
    type: 'message' | 'assignment';
    event_id: number;
    event_name: string;
    user_name: string;
    description: string;
    message?: string;
    status?: {
        value: string;
        label: string;
        color: string;
    };
    notes?: string;
    formatted_date: string;
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
    required_staff_count: number;
    accepted_count: number;
    pending_count?: number;
    assignments_count?: number;
    messages_count?: number;
    compensation?: {
        hourly_rate: number;
        total_amount: number;
    };
    days_until: number;
}

interface Stats {
    total_events: number;
    active_events: number;
    completed_events: number;
    total_staff: number;
}

interface PendingRequest {
    id: number;
    event_id: number;
    event_name: string;
    event_date: string;
    event_location: string;
    user_id: number;
    user_name: string;
    user_email: string;
    status: {
        value: string;
        label: string;
        color: string;
    };
    notes?: string;
    created_at: string;
    time_ago: string;
}

interface DashboardProps {
    recentActivities: Activity[];
    activeProjects: Project[];
    upcomingProjects: Project[];
    pendingRequests: PendingRequest[];
    stats: Stats;
}

export default function Dashboard({ 
    recentActivities = [], 
    activeProjects = [], 
    upcomingProjects = [],
    pendingRequests = [],
    stats 
}: DashboardProps) {
    const { flash } = usePage<SharedData>().props;
    const [processingId, setProcessingId] = useState<number | null>(null);

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

    const handleApprove = (assignmentId: number) => {
        setProcessingId(assignmentId);
        router.post(
            `/admin/assignments/${assignmentId}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            }
        );
    };

    const handleReject = (assignmentId: number) => {
        setProcessingId(assignmentId);
        router.post(
            `/admin/assignments/${assignmentId}/reject`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            }
        );
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

    const formatDaysUntil = (daysUntil: number) => {
        if (daysUntil === 0) return 'Today!';
        if (daysUntil === 1) return 'Tomorrow';
        
        const days = Math.floor(daysUntil);
        const hours = Math.round((daysUntil - days) * 24);
        
        if (days === 0) {
            return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        }
        
        if (hours === 0) {
            return `In ${days} ${days === 1 ? 'day' : 'days'}`;
        }
        
        return `In ${days} ${days === 1 ? 'day' : 'days'}, ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agency Owner Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_events || 0}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.active_events || 0}</div>
                            <p className="text-xs text-muted-foreground">In progress</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.completed_events || 0}</div>
                            <p className="text-xs text-muted-foreground">Successfully finished</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total_staff || 0}</div>
                            <p className="text-xs text-muted-foreground">Available staff</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <Card className="border-yellow-200 dark:border-yellow-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                Pending Assignment Requests
                                <Badge variant="secondary" className="ml-2">
                                    {pendingRequests.length}
                                </Badge>
                            </CardTitle>
                            <CardDescription>Staff members waiting for approval</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="border rounded-lg p-4 space-y-3 bg-yellow-50/50 dark:bg-yellow-950/10">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-semibold">{request.user_name}</span>
                                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                                                        {request.status.label}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{request.user_email}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {request.time_ago}
                                            </span>
                                        </div>
                                        
                                        <div className="border-t pt-3 space-y-2">
                                            <Link 
                                                href={`/admin/events/${request.event_id}`}
                                                className="font-medium text-sm hover:underline block"
                                            >
                                                {request.event_name}
                                            </Link>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(request.event_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">{request.event_location}</span>
                                                </div>
                                            </div>
                                            {request.notes && (
                                                <p className="text-xs text-muted-foreground italic">
                                                    Note: {request.notes}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                size="sm" 
                                                variant="default" 
                                                className="flex-1"
                                                onClick={() => handleApprove(request.id)}
                                                disabled={processingId === request.id}
                                            >
                                                {processingId === request.id ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        Approving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Approve
                                                    </>
                                                )}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="flex-1"
                                                onClick={() => handleReject(request.id)}
                                                disabled={processingId === request.id}
                                            >
                                                {processingId === request.id ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        Rejecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Reject
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Activities */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Activities
                            </CardTitle>
                            <CardDescription>Latest updates from your events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                {recentActivities.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No recent activities</p>
                                ) : (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex gap-4 items-start border-b pb-4 last:border-0">
                                            <div className="mt-1">
                                                {activity.type === 'message' ? (
                                                    <MessageSquare className="h-5 w-5 text-blue-500" />
                                                ) : (
                                                    <UserCheck className="h-5 w-5 text-green-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <Link 
                                                        href={`/admin/events/${activity.event_id}`}
                                                        className="font-medium text-sm hover:underline"
                                                    >
                                                        {activity.event_name}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground">
                                                        {activity.formatted_date}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">{activity.user_name}</span> - {activity.description}
                                                </p>
                                                {activity.status && (
                                                    <Badge variant="outline" className={getStatusColor(activity.status.color)}>
                                                        {activity.status.label}
                                                    </Badge>
                                                )}
                                                {activity.message && (
                                                    <p className="text-sm italic text-muted-foreground mt-1">
                                                        "{activity.message}"
                                                    </p>
                                                )}
                                                {activity.notes && (
                                                    <p className="text-sm italic text-muted-foreground mt-1">
                                                        "{activity.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Projects */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarClock className="h-5 w-5" />
                                Upcoming Events
                            </CardTitle>
                            <CardDescription>Events scheduled in the near future</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                {upcomingProjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No upcoming events</p>
                                ) : (
                                    upcomingProjects.map((project) => (
                                        <div key={project.id} className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Link 
                                                        href={`/admin/events/${project.id}`}
                                                        className="font-semibold hover:underline"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`ml-2 ${getStatusColor(project.status.color)}`}
                                                    >
                                                        {project.status.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {project.description}
                                            </p>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(project.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatTime(project.time_from)} - {formatTime(project.time_to)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">{project.location}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4" />
                                                    <span className="font-medium">{project.accepted_count}/{project.required_staff_count}</span>
                                                    <span className="text-muted-foreground">staff</span>
                                                </div>
                                                {project.days_until >= 0 && (
                                                    <span className={`text-xs font-medium ${
                                                        project.days_until <= 3 ? 'text-red-600 dark:text-red-400' :
                                                        project.days_until <= 7 ? 'text-yellow-600 dark:text-yellow-400' :
                                                        'text-green-600 dark:text-green-400'
                                                    }`}>
                                                        {formatDaysUntil(project.days_until)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Projects */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Active Projects
                        </CardTitle>
                        <CardDescription>Events currently in progress (New, Staffing, Ready)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeProjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No active projects</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activeProjects.map((project) => (
                                    <div key={project.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <Link 
                                                    href={`/admin/events/${project.id}`}
                                                    className="font-semibold hover:underline block"
                                                >
                                                    {project.name}
                                                </Link>
                                                <Badge 
                                                    variant="outline" 
                                                    className={`mt-1 ${getStatusColor(project.status.color)}`}
                                                >
                                                    {project.status.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {project.description}
                                        </p>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(project.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatTime(project.time_from)} - {formatTime(project.time_to)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{project.location}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-3 border-t space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Staff Progress</span>
                                                <span className="font-medium">
                                                    {project.accepted_count}/{project.required_staff_count}
                                                </span>
                                            </div>
                                            
                                            <div className="w-full bg-secondary rounded-full h-2">
                                                <div 
                                                    className="bg-green-500 h-2 rounded-full transition-all"
                                                    style={{ 
                                                        width: `${Math.min((project.accepted_count / project.required_staff_count) * 100, 100)}%` 
                                                    }}
                                                />
                                            </div>
                                            
                                            {project.pending_count !== undefined && project.pending_count > 0 && (
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{project.pending_count} pending</span>
                                                    <span>{project.messages_count || 0} messages</span>
                                                </div>
                                            )}
                                            
                                            {project.compensation && (
                                                <div className="text-xs text-muted-foreground pt-1">
                                                    Rate: ${project.compensation.hourly_rate}/hr
                                                </div>
                                            )}
                                        </div>
                                        
                                        {project.days_until >= 0 && (
                                            <div className="pt-2">
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                    project.days_until <= 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                                    project.days_until <= 7 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                }`}>
                                                    {formatDaysUntil(project.days_until)}
                                                </span>
                                            </div>
                                        )}
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
