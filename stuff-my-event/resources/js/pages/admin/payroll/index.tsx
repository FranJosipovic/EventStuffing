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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Loader2,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
    default_hourly_rate: number;
    compensation_type: string;
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

    // Initialize payment data with event's default rate or last payment rate
    useEffect(() => {
        const initialData: PaymentData = {};
        events.forEach((event) => {
            initialData[event.id] = {};
            event.staff.forEach((staff) => {
                if (event.compensation_type === 'fixed') {
                    // Fixed: use the fixed amount directly
                    const fixedAmount =
                        staff.last_hourly_rate ||
                        event.default_hourly_rate ||
                        0;
                    initialData[event.id][staff.user_id] = {
                        hourlyRate: 0,
                        amount: fixedAmount,
                    };
                } else {
                    // Hourly: calculate based on hours × rate
                    const hourlyRate =
                        staff.last_hourly_rate ||
                        event.default_hourly_rate ||
                        0;
                    initialData[event.id][staff.user_id] = {
                        hourlyRate,
                        amount: hourlyRate * event.hours_worked,
                    };
                }
            });
        });
        setPaymentData(initialData);
    }, [events]);

    const handleHourlyRateChange = (
        eventId: number,
        userId: number,
        rate: string,
    ) => {
        const numRate = parseFloat(rate) || 0;
        const event = events.find((e) => e.id === eventId);
        const hoursWorked = event?.hours_worked || 0;

        setPaymentData((prev) => ({
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

    const handleFixedAmountChange = (
        eventId: number,
        userId: number,
        amount: string,
    ) => {
        const numAmount = parseFloat(amount) || 0;

        setPaymentData((prev) => ({
            ...prev,
            [eventId]: {
                ...prev[eventId],
                [userId]: {
                    hourlyRate: 0,
                    amount: numAmount,
                },
            },
        }));
    };

    const handleProcessPayment = (eventId: number) => {
        const event = events.find((e) => e.id === eventId);
        if (!event) return;

        const payments = event.staff.map((staff) => ({
            assignment_id: staff.assignment_id,
            user_id: staff.user_id,
            hours_worked: event.hours_worked,
            hourly_rate: paymentData[eventId]?.[staff.user_id]?.hourlyRate || 0,
            amount: paymentData[eventId]?.[staff.user_id]?.amount || 0,
        }));

        // Validate that all amounts are set
        const invalidPayments = payments.filter((p) => p.amount <= 0);
        if (invalidPayments.length > 0) {
            toast.error('Please set amount for all staff members');
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
            },
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
                        <h1 className="text-3xl font-bold tracking-tight">
                            Payroll Management
                        </h1>
                        <p className="mt-2 text-muted-foreground">
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
                        events.map((event) => {
                            const eventTotal = getEventTotal(event);
                            const alreadyPaid = getTotalStaffEarnings(
                                event.staff,
                            );
                            const isPaid = event.has_been_paid;
                            const isProcessing = processingEvent === event.id;

                            return (
                                <Card key={event.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-2xl">
                                                    {event.name}
                                                </CardTitle>
                                                <CardDescription className="mt-2 flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {event.formatted_date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {event.time_from} -{' '}
                                                        {event.time_to}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {event.staff.length}{' '}
                                                        staff
                                                    </span>
                                                    {event.default_hourly_rate >
                                                        0 && (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <DollarSign className="h-4 w-4" />
                                                            €
                                                            {event.default_hourly_rate.toFixed(
                                                                2,
                                                            )}
                                                            {event.compensation_type ===
                                                            'fixed'
                                                                ? ' (fixed)'
                                                                : '/hr'}
                                                        </span>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="px-3 py-1 text-lg"
                                            >
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
                                                            <th className="p-3 text-left font-medium">
                                                                Staff Member
                                                            </th>
                                                            {event.compensation_type ===
                                                                'hourly' && (
                                                                <>
                                                                    <th className="p-3 text-center font-medium">
                                                                        Hours
                                                                    </th>
                                                                    <th className="p-3 text-center font-medium">
                                                                        Rate
                                                                        (€/hr)
                                                                    </th>
                                                                </>
                                                            )}
                                                            <th className="p-3 text-right font-medium">
                                                                Amount (€)
                                                            </th>
                                                            <th className="p-3 text-right font-medium">
                                                                Already Paid
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {event.staff.map(
                                                            (staff) => {
                                                                const payment =
                                                                    paymentData[
                                                                        event.id
                                                                    ]?.[
                                                                        staff
                                                                            .user_id
                                                                    ];
                                                                const isFixed =
                                                                    event.compensation_type ===
                                                                    'fixed';
                                                                return (
                                                                    <tr
                                                                        key={
                                                                            staff.user_id
                                                                        }
                                                                        className="border-b last:border-0"
                                                                    >
                                                                        <td className="p-3">
                                                                            <div>
                                                                                <p className="font-medium">
                                                                                    {
                                                                                        staff.user_name
                                                                                    }
                                                                                </p>
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    {
                                                                                        staff.user_email
                                                                                    }
                                                                                </p>
                                                                                {staff.last_paid_at && (
                                                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                                                        Last
                                                                                        paid:{' '}
                                                                                        {
                                                                                            staff.last_paid_at
                                                                                        }
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        {!isFixed && (
                                                                            <>
                                                                                <td className="p-3 text-center">
                                                                                    <Badge variant="outline">
                                                                                        {
                                                                                            event.hours_worked
                                                                                        }

                                                                                        h
                                                                                    </Badge>
                                                                                </td>
                                                                                <td className="p-3">
                                                                                    <Input
                                                                                        type="number"
                                                                                        step="0.01"
                                                                                        min="0"
                                                                                        value={
                                                                                            payment?.hourlyRate ||
                                                                                            ''
                                                                                        }
                                                                                        onChange={(
                                                                                            e,
                                                                                        ) =>
                                                                                            handleHourlyRateChange(
                                                                                                event.id,
                                                                                                staff.user_id,
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                            )
                                                                                        }
                                                                                        className="mx-auto w-24 text-center"
                                                                                        disabled={
                                                                                            isPaid ||
                                                                                            isProcessing
                                                                                        }
                                                                                        placeholder="0.00"
                                                                                    />
                                                                                </td>
                                                                            </>
                                                                        )}
                                                                        <td className="p-3 text-right">
                                                                            {isFixed ? (
                                                                                <Input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    min="0"
                                                                                    value={
                                                                                        payment?.amount ||
                                                                                        ''
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        handleFixedAmountChange(
                                                                                            event.id,
                                                                                            staff.user_id,
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    className="ml-auto w-28 text-right"
                                                                                    disabled={
                                                                                        isPaid ||
                                                                                        isProcessing
                                                                                    }
                                                                                    placeholder="0.00"
                                                                                />
                                                                            ) : (
                                                                                <span className="font-semibold text-green-600">
                                                                                    €
                                                                                    {(
                                                                                        payment?.amount ||
                                                                                        0
                                                                                    ).toFixed(
                                                                                        2,
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td className="p-3 text-right">
                                                                            <span className="text-muted-foreground">
                                                                                €
                                                                                {staff.total_paid.toFixed(
                                                                                    2,
                                                                                )}
                                                                                {staff.payment_count >
                                                                                    0 && (
                                                                                    <span className="ml-1 text-xs">
                                                                                        (
                                                                                        {
                                                                                            staff.payment_count
                                                                                        }
                                                                                        ×)
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            },
                                                        )}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-muted/50 font-semibold">
                                                            <td
                                                                colSpan={
                                                                    event.compensation_type ===
                                                                    'hourly'
                                                                        ? 3
                                                                        : 1
                                                                }
                                                                className="p-3 text-right"
                                                            >
                                                                Event Total:
                                                            </td>
                                                            <td className="p-3 text-right text-lg text-green-600">
                                                                €
                                                                {eventTotal.toFixed(
                                                                    2,
                                                                )}
                                                            </td>
                                                            <td className="p-3 text-right text-muted-foreground">
                                                                €
                                                                {alreadyPaid.toFixed(
                                                                    2,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            {/* Pay Button */}
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() =>
                                                        handleProcessPayment(
                                                            event.id,
                                                        )
                                                    }
                                                    disabled={
                                                        isPaid ||
                                                        isProcessing ||
                                                        eventTotal === 0
                                                    }
                                                    size="lg"
                                                    className="min-w-[200px]"
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : isPaid ? (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Payment Processed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DollarSign className="mr-2 h-4 w-4" />
                                                            Process Payment (€
                                                            {eventTotal.toFixed(
                                                                2,
                                                            )}
                                                            )
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
                                Total earnings per staff member across all
                                events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">
                                                Staff Member
                                            </th>
                                            <th className="p-3 text-center font-medium">
                                                Payments
                                            </th>
                                            <th className="p-3 text-right font-medium">
                                                Total Earned
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffSummary.map((staff) => (
                                            <tr
                                                key={staff.user_id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {staff.user_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {staff.user_email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Badge variant="outline">
                                                        {staff.payment_count}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <span className="text-lg font-semibold text-green-600">
                                                        €
                                                        {staff.total_earned.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-muted/50 font-bold">
                                            <td
                                                colSpan={2}
                                                className="p-3 text-right"
                                            >
                                                Grand Total:
                                            </td>
                                            <td className="p-3 text-right text-xl text-green-600">
                                                €
                                                {staffSummary
                                                    .reduce(
                                                        (sum, s) =>
                                                            sum +
                                                            s.total_earned,
                                                        0,
                                                    )
                                                    .toFixed(2)}
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
