import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    DollarSign, 
    Calendar, 
    Clock, 
    Users,
    CheckCircle,
    Loader2,
    TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll',
        href: '/admin/payroll',
    },
];

interface Staff {
    assignment_id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    hours_worked: number;
    total_paid: number;
    last_hourly_rate: number;
    last_paid_at?: string;
    payment_count: number;
}

interface Event {
    id: number;
    name: string;
    date: string;
    formatted_date: string;
    time_from: string;
    time_to: string;
    hours_worked: number;
    has_been_paid: boolean;
    staff: Staff[];
}

interface StaffSummary {
    user_id: number;
    user_name: string;
    user_email: string;
    total_earned: number;
    payment_count: number;
}

interface PayrollProps {
    events: Event[];
    staffSummary: StaffSummary[];
}

interface PaymentData {
    [eventId: number]: {
        [userId: number]: {
            hourlyRate: number;
            amount: number;
        };
    };
}

export default function PayrollIndex({ events, staffSummary }: PayrollProps) {
    const { flash } = usePage<SharedData>().props;
    const [paymentData, setPaymentData] = useState<PaymentData>({});
    const [processingEvent, setProcessingEvent] = useState<number | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Initialize payment data with last rates
    useEffect(() => {
        const initialData: PaymentData = {};
        events.forEach(event => {
            initialData[event.id] = {};
            event.staff.forEach(staff => {
                const hourlyRate = staff.last_hourly_rate || 0;
                initialData[event.id][staff.user_id] = {
                    hourlyRate,
                    amount: hourlyRate * event.hours_worked,
                };
            });
        });
        setPaymentData(initialData);
    }, [events]);

    const handleHourlyRateChange = (eventId: number, userId: number, rate: string) => {
        const numRate = parseFloat(rate) || 0;
        const event = events.find(e => e.id === eventId);
        const hoursWorked = event?.hours_worked || 0;

        setPaymentData(prev => ({
            ...prev,
            [eventId]: {
                ...prev[eventId],
                [userId]: {
                    hourlyRate: numRate,
                    amount: numRate * hoursWorked,
                },
            },
        }));
    };

    const handleProcessPayment = (eventId: number) => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        const payments = event.staff.map(staff => ({
            assignment_id: staff.assignment_id,
            user_id: staff.user_id,
            hours_worked: event.hours_worked,
            hourly_rate: paymentData[eventId]?.[staff.user_id]?.hourlyRate || 0,
            amount: paymentData[eventId]?.[staff.user_id]?.amount || 0,
        }));

        // Validate that all rates are set
        const invalidPayments = payments.filter(p => p.hourly_rate <= 0);
        if (invalidPayments.length > 0) {
            toast.error('Please set hourly rate for all staff members');
            return;
        }

        setProcessingEvent(eventId);
        router.post(
            `/admin/payroll/events/${eventId}/process`,
            { payments },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Payment processed successfully!');
                },
                onError: () => {
                    toast.error('Failed to process payment');
                },
                onFinish: () => {
                    setProcessingEvent(null);
                },
            }
        );
    };

    const getEventTotal = (event: Event): number => {
        return event.staff.reduce((sum, staff) => {
            return sum + (paymentData[event.id]?.[staff.user_id]?.amount || 0);
        }, 0);
    };

    const getTotalStaffEarnings = (staff: Staff[]): number => {
        return staff.reduce((sum, s) => sum + s.total_paid, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Process payments for completed events
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                {/* Events List */}
                <div className="space-y-6">
                    {events.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-center text-muted-foreground">
                                    No completed events found
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        events.map(event => {
                            const eventTotal = getEventTotal(event);
                            const alreadyPaid = getTotalStaffEarnings(event.staff);
                            const isPaid = event.has_been_paid;
                            const isProcessing = processingEvent === event.id;

                            return (
                                <Card key={event.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-2xl">{event.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-4 mt-2">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {event.formatted_date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {event.time_from} - {event.time_to}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {event.staff.length} staff
                                                    </span>
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="text-lg px-3 py-1">
                                                {event.hours_worked}h
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Staff Table */}
                                            <div className="rounded-lg border">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b bg-muted/50">
                                                            <th className="text-left p-3 font-medium">Staff Member</th>
                                                            <th className="text-center p-3 font-medium">Hours</th>
                                                            <th className="text-center p-3 font-medium">Rate (€/hr)</th>
                                                            <th className="text-right p-3 font-medium">Amount (€)</th>
                                                            <th className="text-right p-3 font-medium">Already Paid</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {event.staff.map(staff => {
                                                            const payment = paymentData[event.id]?.[staff.user_id];
                                                            return (
                                                                <tr key={staff.user_id} className="border-b last:border-0">
                                                                    <td className="p-3">
                                                                        <div>
                                                                            <p className="font-medium">{staff.user_name}</p>
                                                                            <p className="text-sm text-muted-foreground">{staff.user_email}</p>
                                                                            {staff.last_paid_at && (
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                    Last paid: {staff.last_paid_at}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 text-center">
                                                                        <Badge variant="outline">{event.hours_worked}h</Badge>
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            value={payment?.hourlyRate || ''}
                                                                            onChange={(e) => handleHourlyRateChange(event.id, staff.user_id, e.target.value)}
                                                                            className="w-24 mx-auto text-center"
                                                                            disabled={isPaid || isProcessing}
                                                                            placeholder="0.00"
                                                                        />
                                                                    </td>
                                                                    <td className="p-3 text-right">
                                                                        <span className="font-semibold text-green-600">
                                                                            €{(payment?.amount || 0).toFixed(2)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-3 text-right">
                                                                        <span className="text-muted-foreground">
                                                                            €{staff.total_paid.toFixed(2)}
                                                                            {staff.payment_count > 0 && (
                                                                                <span className="text-xs ml-1">
                                                                                    ({staff.payment_count}×)
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-muted/50 font-semibold">
                                                            <td colSpan={3} className="p-3 text-right">Event Total:</td>
                                                            <td className="p-3 text-right text-green-600 text-lg">
                                                                €{eventTotal.toFixed(2)}
                                                            </td>
                                                            <td className="p-3 text-right text-muted-foreground">
                                                                €{alreadyPaid.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            {/* Pay Button */}
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() => handleProcessPayment(event.id)}
                                                    disabled={isPaid || isProcessing || eventTotal === 0}
                                                    size="lg"
                                                    className="min-w-[200px]"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : isPaid ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Payment Processed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DollarSign className="h-4 w-4 mr-2" />
                                                            Process Payment (€{eventTotal.toFixed(2)})
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Staff Summary */}
                {staffSummary.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Staff Earnings Summary
                            </CardTitle>
                            <CardDescription>
                                Total earnings per staff member across all events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left p-3 font-medium">Staff Member</th>
                                            <th className="text-center p-3 font-medium">Payments</th>
                                            <th className="text-right p-3 font-medium">Total Earned</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffSummary.map(staff => (
                                            <tr key={staff.user_id} className="border-b last:border-0">
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">{staff.user_name}</p>
                                                        <p className="text-sm text-muted-foreground">{staff.user_email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Badge variant="outline">{staff.payment_count}</Badge>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <span className="font-semibold text-green-600 text-lg">
                                                        €{staff.total_earned.toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-muted/50 font-bold">
                                            <td colSpan={2} className="p-3 text-right">Grand Total:</td>
                                            <td className="p-3 text-right text-green-600 text-xl">
                                                €{staffSummary.reduce((sum, s) => sum + s.total_earned, 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
