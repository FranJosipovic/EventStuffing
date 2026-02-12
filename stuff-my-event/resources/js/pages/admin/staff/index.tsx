import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { 
    Search, 
    UserPlus, 
    Users, 
    Shield, 
    UserCheck,
    Activity,
    Edit,
    Trash2,
    Mail
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff Management',
        href: '/admin/staff',
    },
];

interface Role {
    id: number;
    value: string;
    label: string;
    is_system?: boolean;
}

interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: {
        value: string;
        label: string;
    };
    role_id: number;
    event_assignments_count: number;
    accepted_events_count: number;
    pending_events_count: number;
    created_at: string;
    is_owner: boolean;
}

interface Stats {
    total_staff: number;
    agency_owners: number;
    staff_members: number;
    active_this_month: number;
}

interface Filters {
    search: string;
    role: string;
}

interface Props {
    staffMembers: StaffMember[];
    roles: Role[];
    stats: Stats;
    filters: Filters;
}

export default function StaffIndex({ staffMembers, roles, stats, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

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

    // Create form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role_id: roles[0]?.id || 0,
    });

    // Edit form
    const editForm = useForm({
        name: '',
        email: '',
        role_id: 0,
        password: '',
    });

    const handleSearch = () => {
        router.get('/admin/staff', {
            search: searchQuery,
            role: roleFilter,
        }, {
            preserveState: true,
        });
    };

    const handleRoleFilter = (value: string) => {
        setRoleFilter(value);
        router.get('/admin/staff', {
            search: searchQuery,
            role: value,
        }, {
            preserveState: true,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/staff', {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditDialog = (member: StaffMember) => {
        setEditingMember(member);
        editForm.setData({
            name: member.name,
            email: member.email,
            role_id: member.role_id,
            password: '',
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;

        editForm.put(`/admin/staff/${editingMember.id}`, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingMember(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (member: StaffMember) => {
        if (confirm(`Are you sure you want to delete ${member.name}? This action cannot be undone.`)) {
            router.delete(`/admin/staff/${member.id}`);
        }
    };

    const getRoleBadgeColor = (roleValue: string) => {
        return roleValue === 'agency_owner' 
            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
            : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_staff}</div>
                            <p className="text-xs text-muted-foreground">All team members</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Agency Owners</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.agency_owners}</div>
                            <p className="text-xs text-muted-foreground">With admin access</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.staff_members}</div>
                            <p className="text-xs text-muted-foreground">Regular employees</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active This Month</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_this_month}</div>
                            <p className="text-xs text-muted-foreground">With assignments</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Staff Members</CardTitle>
                                <CardDescription>Manage your team members, roles, and permissions</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/admin/roles">
                                    <Button variant="outline">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Manage Roles
                                    </Button>
                                </Link>
                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add Staff Member
                                        </Button>
                                    </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleCreateSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Add New Staff Member</DialogTitle>
                                            <DialogDescription>
                                                Create a new user account for your agency
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="create-name">Full Name</Label>
                                                <Input
                                                    id="create-name"
                                                    value={createForm.data.name}
                                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                                    placeholder="John Doe"
                                                    required
                                                />
                                                {createForm.errors.name && (
                                                    <p className="text-sm text-red-500">{createForm.errors.name}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="create-email">Email</Label>
                                                <Input
                                                    id="create-email"
                                                    type="email"
                                                    value={createForm.data.email}
                                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                                {createForm.errors.email && (
                                                    <p className="text-sm text-red-500">{createForm.errors.email}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="create-password">Password</Label>
                                                <Input
                                                    id="create-password"
                                                    type="password"
                                                    value={createForm.data.password}
                                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                {createForm.errors.password && (
                                                    <p className="text-sm text-red-500">{createForm.errors.password}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="create-role">Role</Label>
                                                <Select
                                                    value={createForm.data.role_id.toString()}
                                                    onValueChange={(value) => createForm.setData('role_id', parseInt(value))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roles.map((role) => (
                                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                                {role.label}
                                                                {role.is_system && <span className="ml-2 text-xs text-muted-foreground">(System)</span>}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {createForm.errors.role_id && (
                                                    <p className="text-sm text-red-500">{createForm.errors.role_id}</p>
                                                )}
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsCreateDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={createForm.processing}>
                                                {createForm.processing ? 'Creating...' : 'Create Staff Member'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Search and Filter */}
                        <div className="mb-6 flex gap-4">
                            <div className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <Button onClick={handleSearch}>Search</Button>
                            </div>
                            <Select value={roleFilter} onValueChange={handleRoleFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Staff Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-center">Assignments</TableHead>
                                        <TableHead className="text-center">Accepted</TableHead>
                                        <TableHead className="text-center">Pending</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffMembers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                No staff members found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        staffMembers.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell className="font-medium">{member.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {member.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getRoleBadgeColor(member.role.value)}>
                                                        {member.role.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {member.event_assignments_count}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                        {member.accepted_events_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                                        {member.pending_events_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {member.created_at}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditDialog(member)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {!member.is_owner && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(member)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Staff Member</DialogTitle>
                                <DialogDescription>
                                    Update staff member information and role
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-sm text-red-500">{editForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                    />
                                    {editForm.errors.email && (
                                        <p className="text-sm text-red-500">{editForm.errors.email}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select
                                        value={editForm.data.role_id.toString()}
                                        onValueChange={(value) => editForm.setData('role_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.label}
                                                    {role.is_system && <span className="ml-2 text-xs text-muted-foreground">(System)</span>}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editForm.errors.role_id && (
                                        <p className="text-sm text-red-500">{editForm.errors.role_id}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-password">New Password (optional)</Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        placeholder="Leave blank to keep current"
                                    />
                                    {editForm.errors.password && (
                                        <p className="text-sm text-red-500">{editForm.errors.password}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
