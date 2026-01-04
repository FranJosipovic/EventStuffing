'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { Building2, Calendar, UserCircle } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [view, setView] = useState<'role' | 'login'>('role');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        role: '',
    });

    const roles = [
        {
            id: 'agency_owner',
            title: 'Agency Owner',
            description:
                'Full access to manage staff, events, payroll, and business analytics',
            icon: Building2,
        },
        {
            id: 'staff_member',
            title: 'Staff Member',
            description:
                'View your schedule, clock in/out, submit timesheets, and update availability',
            icon: UserCircle,
        },
    ];

    const handleRoleSelect = (roleId: string) => {
        setData('role', roleId);
        setView('login');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
            onError: () => {
                // Errors are automatically handled by Inertia
            },
        });
    };

    if (view === 'role') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="flex w-full max-w-4xl flex-col justify-center">
                    <div className="mb-8 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                <Calendar className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="text-2xl font-semibold text-foreground">
                                StaffSync
                            </span>
                        </Link>
                        <h1 className="mt-6 text-3xl font-bold text-balance text-foreground">
                            Welcome back
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Select your role to continue
                        </p>
                    </div>

                    <div className="grid w-2/3 gap-6 self-center md:grid-cols-2">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            return (
                                <Card
                                    key={role.id}
                                    className="cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-lg"
                                    onClick={() => handleRoleSelect(role.id)}
                                >
                                    <CardHeader className="text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                                            <Icon className="h-8 w-8 text-accent-foreground" />
                                        </div>
                                        <CardTitle className="text-foreground">
                                            {role.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-center text-muted-foreground">
                                            {role.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {canRegister && (
                        <div className="mt-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link
                                    href="/register"
                                    className="text-primary hover:underline"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const currentRole = roles.find((r) => r.id === data.role);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md border-border bg-card">
                <CardHeader className="text-center">
                    <Link
                        href="/"
                        className="mb-6 inline-flex items-center justify-center gap-2"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Calendar className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-semibold text-foreground">
                            StaffSync
                        </span>
                    </Link>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                        {currentRole && (
                            <currentRole.icon className="h-8 w-8 text-accent-foreground" />
                        )}
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                        Sign in as {currentRole?.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your credentials to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status && (
                        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                                autoFocus
                                autoComplete="username"
                                className="border-border bg-background text-foreground"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-foreground"
                                >
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                required
                                autoComplete="current-password"
                                className="border-border bg-background text-foreground"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                                htmlFor="remember"
                                className="ml-2 text-sm text-muted-foreground"
                            >
                                Remember me
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Button
                            variant="ghost"
                            onClick={() => setView('role')}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            ← Back to role selection
                        </Button>
                    </div>

                    {canRegister && (
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-primary hover:underline"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
