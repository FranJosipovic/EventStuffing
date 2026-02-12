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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { 
    Shield, 
    Plus,
    Edit,
    Trash2,
    Users,
    Lock,
    Unlock
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/admin/roles',
    },
];

interface Role {
    id: number;
    name: string;
    label: string;
    description: string | null;
    permissions: string[];
    is_system: boolean;
    users_count: number;
    created_at: string;
}

interface Props {
    roles: Role[];
    availablePermissions: Record<string, string>;
}

export default function RolesIndex({ roles, availablePermissions }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

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
        label: '',
        description: '',
        permissions: [] as string[],
    });

    // Edit form
    const editForm = useForm({
        name: '',
        label: '',
        description: '',
        permissions: [] as string[],
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/roles', {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditDialog = (role: Role) => {
        setEditingRole(role);
        editForm.setData({
            name: role.name,
            label: role.label,
            description: role.description || '',
            permissions: role.permissions || [],
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;

        editForm.put(`/admin/roles/${editingRole.id}`, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingRole(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (role: Role) => {
        if (confirm(`Are you sure you want to delete the role "${role.label}"? This action cannot be undone.`)) {
            router.delete(`/admin/roles/${role.id}`);
        }
    };

    const togglePermission = (form: any, permission: string) => {
        const currentPermissions = form.data.permissions;
        if (currentPermissions.includes(permission)) {
            form.setData('permissions', currentPermissions.filter((p: string) => p !== permission));
        } else {
            form.setData('permissions', [...currentPermissions, permission]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Role Management</h1>
                        <p className="text-muted-foreground">Create and manage custom roles with specific permissions</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleCreateSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Create New Role</DialogTitle>
                                    <DialogDescription>
                                        Define a new role with custom permissions for your team members
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-name">
                                            Role Name (Internal)
                                            <span className="text-xs text-muted-foreground ml-2">lowercase with underscores, e.g., event_coordinator</span>
                                        </Label>
                                        <Input
                                            id="create-name"
                                            value={createForm.data.name}
                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                            placeholder="event_coordinator"
                                            pattern="[a-z_]+"
                                            required
                                        />
                                        {createForm.errors.name && (
                                            <p className="text-sm text-red-500">{createForm.errors.name}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-label">Display Label</Label>
                                        <Input
                                            id="create-label"
                                            value={createForm.data.label}
                                            onChange={(e) => createForm.setData('label', e.target.value)}
                                            placeholder="Event Coordinator"
                                            required
                                        />
                                        {createForm.errors.label && (
                                            <p className="text-sm text-red-500">{createForm.errors.label}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="create-description">Description</Label>
                                        <Textarea
                                            id="create-description"
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            placeholder="Describe the responsibilities of this role..."
                                            rows={3}
                                        />
                                        {createForm.errors.description && (
                                            <p className="text-sm text-red-500">{createForm.errors.description}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Permissions</Label>
                                        <div className="grid grid-cols-2 gap-3 border rounded-lg p-4">
                                            {Object.entries(availablePermissions).map(([key, label]) => (
                                                <div key={key} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`create-perm-${key}`}
                                                        checked={createForm.data.permissions.includes(key)}
                                                        onCheckedChange={() => togglePermission(createForm, key)}
                                                    />
                                                    <label
                                                        htmlFor={`create-perm-${key}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        {createForm.errors.permissions && (
                                            <p className="text-sm text-red-500">{createForm.errors.permissions}</p>
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
                                        {createForm.processing ? 'Creating...' : 'Create Role'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Roles Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            All Roles
                        </CardTitle>
                        <CardDescription>Manage system and custom roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead className="text-center">Users</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                No roles found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        roles.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{role.label}</div>
                                                        <div className="text-xs text-muted-foreground">{role.name}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {role.description || 'No description'}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions.length === 0 ? (
                                                            <span className="text-xs text-muted-foreground">No permissions</span>
                                                        ) : (
                                                            <>
                                                                {role.permissions.slice(0, 3).map((perm) => (
                                                                    <Badge key={perm} variant="outline" className="text-xs">
                                                                        {availablePermissions[perm] || perm}
                                                                    </Badge>
                                                                ))}
                                                                {role.permissions.length > 3 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{role.permissions.length - 3} more
                                                                    </Badge>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Users className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{role.users_count}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {role.is_system ? (
                                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                                                            <Lock className="h-3 w-3 mr-1" />
                                                            System
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                                            <Unlock className="h-3 w-3 mr-1" />
                                                            Custom
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {!role.is_system && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEditDialog(role)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(role)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                                    disabled={role.users_count > 0}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {role.is_system && (
                                                            <span className="text-xs text-muted-foreground px-2">Protected</span>
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
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Role</DialogTitle>
                                <DialogDescription>
                                    Update role details and permissions
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">
                                        Role Name (Internal)
                                        <span className="text-xs text-muted-foreground ml-2">lowercase with underscores</span>
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        pattern="[a-z_]+"
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-sm text-red-500">{editForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-label">Display Label</Label>
                                    <Input
                                        id="edit-label"
                                        value={editForm.data.label}
                                        onChange={(e) => editForm.setData('label', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.label && (
                                        <p className="text-sm text-red-500">{editForm.errors.label}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        rows={3}
                                    />
                                    {editForm.errors.description && (
                                        <p className="text-sm text-red-500">{editForm.errors.description}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Permissions</Label>
                                    <div className="grid grid-cols-2 gap-3 border rounded-lg p-4">
                                        {Object.entries(availablePermissions).map(([key, label]) => (
                                            <div key={key} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`edit-perm-${key}`}
                                                    checked={editForm.data.permissions.includes(key)}
                                                    onCheckedChange={() => togglePermission(editForm, key)}
                                                />
                                                <label
                                                    htmlFor={`edit-perm-${key}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {editForm.errors.permissions && (
                                        <p className="text-sm text-red-500">{editForm.errors.permissions}</p>
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
