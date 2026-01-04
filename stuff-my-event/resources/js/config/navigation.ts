import { type NavItem } from '@/types';
import {
    BookOpen,
    Building2,
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Folder,
    LayoutGrid,
    Settings,
    Users,
} from 'lucide-react';

export const agencyOwnerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Agency',
        href: '/admin/agency',
        icon: Building2,
    },
    {
        title: 'Staff Management',
        href: '/admin/staff',
        icon: Users,
    },
    {
        title: 'Events',
        href: '/admin/events',
        icon: Calendar,
    },
    {
        title: 'Payroll',
        href: '/admin/payroll',
        icon: DollarSign,
    },
    {
        title: 'Reports',
        href: '/admin/reports',
        icon: FileText,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

export const staffMemberNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/staff/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My Schedule',
        href: '/staff/schedule',
        icon: Calendar,
    },
    {
        title: 'Time Tracking',
        href: '/staff/timesheet',
        icon: Clock,
    },
    {
        title: 'My Agency',
        href: '/staff/agency',
        icon: Building2,
    },
    {
        title: 'Profile',
        href: '/staff/profile',
        icon: Settings,
    },
];

export const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function getNavItemsForRole(role: string): NavItem[] {
    switch (role) {
        case 'agency_owner':
            return agencyOwnerNavItems;
        case 'staff_member':
            return staffMemberNavItems;
        default:
            return [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutGrid,
                },
            ];
    }
}
