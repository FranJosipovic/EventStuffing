import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Star,
    Users,
} from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Calendar className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-semibold text-foreground">
                            StaffSync
                        </span>
                    </div>

                    <nav className="hidden items-center gap-8 md:flex">
                        <Link
                            href="#features"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="#testimonials"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Testimonials
                        </Link>
                        <Link
                            href="#contact"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Contact
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-foreground">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 pt-32 pb-20">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-accent px-4 py-1.5 text-sm text-accent-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                        </span>
                        Trusted by 500+ event staffing agencies
                    </div>

                    <h1 className="mb-6 text-5xl leading-tight font-bold tracking-tight text-balance text-foreground md:text-6xl lg:text-7xl">
                        The complete platform to manage your staffing agency
                    </h1>

                    <p className="mb-10 text-lg text-pretty text-muted-foreground md:text-xl">
                        Streamline operations, automate scheduling, and grow
                        your event staffing business with our all-in-one
                        management platform. From staff onboarding to payroll
                        processing.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/auth">
                            <Button
                                size="lg"
                                className="h-12 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 border-border bg-transparent px-8 text-base"
                        >
                            Watch Demo
                        </Button>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                            No credit card required
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                            14-day free trial
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                            Cancel anytime
                        </div>
                    </div>
                </div>

                {/* Hero Image/Stats Section */}
                <div className="mx-auto mt-20 max-w-6xl">
                    <div className="grid gap-6 md:grid-cols-4">
                        {[
                            {
                                label: 'Active Agencies',
                                value: '500+',
                                icon: Users,
                            },
                            {
                                label: 'Events Managed',
                                value: '50K+',
                                icon: Calendar,
                            },
                            {
                                label: 'Hours Tracked',
                                value: '2M+',
                                icon: Clock,
                            },
                            {
                                label: 'Revenue Processed',
                                value: '$120M+',
                                icon: DollarSign,
                            },
                        ].map((stat) => (
                            <Card
                                key={stat.label}
                                className="border-border bg-card p-6"
                            >
                                <stat.icon className="mb-3 h-8 w-8 text-muted-foreground" />
                                <div className="text-3xl font-bold text-foreground">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {stat.label}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="border-t border-border bg-accent/30 py-20"
            >
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
                            Everything you need to run your agency
                        </h2>
                        <p className="text-lg text-pretty text-muted-foreground">
                            Powerful tools designed specifically for event
                            staffing agencies
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: Users,
                                title: 'Staff Management',
                                description:
                                    'Complete staff profiles with skills, certifications, availability, and performance tracking. Streamline onboarding and maintain compliance.',
                            },
                            {
                                icon: Calendar,
                                title: 'Event Scheduling',
                                description:
                                    'Visual calendar with drag-and-drop scheduling. Smart matching algorithm suggests best staff for each event based on skills and availability.',
                            },
                            {
                                icon: Clock,
                                title: 'Time Tracking',
                                description:
                                    'Accurate timesheet management with clock in/out, breaks, and GPS verification. Automated approval workflows to save hours.',
                            },
                            {
                                icon: DollarSign,
                                title: 'Payroll & Invoicing',
                                description:
                                    'Automated payroll calculations with overtime, bonuses, and deductions. Generate and send professional invoices to clients instantly.',
                            },
                            {
                                icon: BarChart3,
                                title: 'Analytics & Reporting',
                                description:
                                    'Real-time insights into revenue, staff utilization, event profitability, and more. Make data-driven decisions to grow your business.',
                            },
                            {
                                icon: CheckCircle2,
                                title: 'Client Portal',
                                description:
                                    'Give clients access to view events, approve timesheets, and manage invoices. Improve transparency and reduce admin work.',
                            },
                        ].map((feature) => (
                            <Card
                                key={feature.title}
                                className="border-border bg-card p-8 transition-all hover:shadow-lg"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                                    <feature.icon className="h-6 w-6 text-accent-foreground" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
                            Trusted by leading agencies
                        </h2>
                        <p className="text-lg text-pretty text-muted-foreground">
                            See what our customers have to say about StaffSync
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Owner, Premier Events Staffing',
                                content:
                                    'StaffSync has transformed how we manage our 150+ staff members. The automated scheduling alone saves us 20 hours per week.',
                                rating: 5,
                            },
                            {
                                name: 'Michael Chen',
                                role: 'Operations Manager, Elite Staff Solutions',
                                content:
                                    'The timesheet approval workflow is a game-changer. What used to take days now takes minutes. Our clients love the transparency.',
                                rating: 5,
                            },
                            {
                                name: 'Emily Rodriguez',
                                role: 'Director, EventPro Staffing',
                                content:
                                    "We've increased our revenue by 40% since implementing StaffSync. The analytics help us price events correctly and optimize staff allocation.",
                                rating: 5,
                            },
                        ].map((testimonial) => (
                            <Card
                                key={testimonial.name}
                                className="border-border bg-card p-8"
                            >
                                <div className="mb-4 flex gap-1">
                                    {Array.from({
                                        length: testimonial.rating,
                                    }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-5 w-5 fill-chart-3 text-chart-3"
                                        />
                                    ))}
                                </div>
                                <p className="mb-6 text-foreground">
                                    {testimonial.content}
                                </p>
                                <div>
                                    <div className="font-semibold text-foreground">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="border-t border-border bg-accent/30 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-balance text-foreground md:text-4xl">
                        Ready to transform your staffing agency?
                    </h2>
                    <p className="mb-10 text-lg text-pretty text-muted-foreground">
                        Join hundreds of agencies using StaffSync to streamline
                        operations and grow their business.
                    </p>
                    <Link href="/auth">
                        <Button
                            size="lg"
                            className="h-12 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
                        >
                            Start Your Free Trial
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                    <Calendar className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="text-lg font-semibold text-foreground">
                                    StaffSync
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The complete platform for event staffing
                                agencies.
                            </p>
                        </div>

                        <div>
                            <h4 className="mb-4 font-semibold text-foreground">
                                Product
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href="#features"
                                        className="hover:text-foreground"
                                    >
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#pricing"
                                        className="hover:text-foreground"
                                    >
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Security
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4 font-semibold text-foreground">
                                Company
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Careers
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4 font-semibold text-foreground">
                                Support
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#contact"
                                        className="hover:text-foreground"
                                    >
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="hover:text-foreground"
                                    >
                                        Status
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
                        <p>&copy; 2026 StaffSync. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
