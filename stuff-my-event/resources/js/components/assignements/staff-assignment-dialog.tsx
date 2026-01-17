import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Clock, Search, X } from 'lucide-react';
import { useState } from 'react';

export interface StaffRequest {
    id: string;
    user_name: string;
    user_role: string;
    status: 'pending';
}

export interface AssignedStaff {
    id: string;
    user_name: string;
    user_role: string;
    responded_at: string;
}

interface StaffAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignedStaff: AssignedStaff[];
    staffRequests: StaffRequest[];
    onAcceptRequest: (requestId: string) => void;
    onRejectRequest: (requestId: string) => void;
    onRemoveStaff: (staffId: string) => void;
}

export function StaffAssignmentDialog({
    open,
    onOpenChange,
    assignedStaff,
    staffRequests,
    onAcceptRequest,
    onRejectRequest,
    onRemoveStaff,
}: StaffAssignmentDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const pendingRequests = staffRequests.filter((r) => r.status === 'pending');
    const filteredAssigned = assignedStaff.filter(
        (staff) =>
            staff.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.user_role.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Manage Staff Assignment</DialogTitle>
                    <DialogDescription>
                        Review staff requests and manage assigned staff members
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    defaultValue="requests"
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="requests">
                            Requests{' '}
                            {pendingRequests.length > 0 && (
                                <Badge className="ml-2">
                                    {pendingRequests.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="assigned">
                            Assigned ({assignedStaff.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="requests"
                        className="mt-4 flex-1 space-y-3 overflow-y-auto"
                    >
                        {pendingRequests.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    No pending staff requests
                                </p>
                            </div>
                        ) : (
                            pendingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                                >
                                    <div className="flex flex-1 items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {request.user_name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-foreground">
                                                    {request.user_name}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {request.user_role}
                                            </p>
                                            {/* <div className="mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">
                                                    Requested{' '}
                                                    {formatDateTime(
                                                        request.responeded_at,
                                                    )}
                                                </p>
                                            </div> */}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() =>
                                                onAcceptRequest(request.id)
                                            }
                                        >
                                            <Check className="mr-1 h-4 w-4" />
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onRejectRequest(request.id)
                                            }
                                        >
                                            <X className="mr-1 h-4 w-4" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent
                        value="assigned"
                        className="mt-4 flex min-h-0 flex-1 flex-col"
                    >
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search assigned staff..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto">
                            {filteredAssigned.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-muted-foreground">
                                        {searchQuery
                                            ? 'No staff found matching your search'
                                            : 'No staff assigned yet'}
                                    </p>
                                </div>
                            ) : (
                                filteredAssigned.map((staff) => (
                                    <div
                                        key={staff.id}
                                        className="flex items-center justify-between rounded-lg border bg-card p-4"
                                    >
                                        <div className="flex flex-1 items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {staff.user_name
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-foreground">
                                                        {staff.user_name}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {staff.user_role}
                                                </p>
                                                <div className="mt-1 flex items-center gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-xs text-muted-foreground">
                                                            Assigned{' '}
                                                            {formatDateTime(
                                                                staff.responded_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                onRemoveStaff(staff.id)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
