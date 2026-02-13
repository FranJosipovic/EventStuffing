import { type NavItem } from '@/types';
import {
    Calendar,
    DollarSign,
    FileText,
    LayoutGrid,
    Settings,
    Shield,
    Users,
} from 'lucide-react';

export const agencyOwnerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Staff Management',
        href: '/admin/staff',
        icon: Users,
    },
    {
        title: 'Role Management',
        href: '/admin/roles',
        icon: Shield,
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
        title: 'Profile',
        href: '/staff/profile',
        icon: Settings,
    },
];

export const footerNavItems: NavItem[] = [];

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
