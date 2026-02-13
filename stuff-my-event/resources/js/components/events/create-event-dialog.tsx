'use client';

import { Button } from '@/components/ui/button';
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
import { useForm } from '@inertiajs/react';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import { Plus } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

const libraries: 'places'[] = ['places'];

export function CreateEventDialog() {
    const [open, setOpen] = useState(false);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(
        null,
    );
    const locationInputRef = useRef<HTMLInputElement | null>(null);

    // Check if Google's autocomplete dropdown is currently visible
    const isPacContainerVisible = () => {
        const pacContainer = document.querySelector('.pac-container');
        if (!pacContainer) return false;
        const style = window.getComputedStyle(pacContainer);
        return style.display !== 'none' && pacContainer.children.length > 0;
    };

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        date: '',
        time_from: '',
        time_to: '',
        location: '',
        location_latitude: 0,
        location_longitude: 0,
        required_staff_count: 1,
    });

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            console.log('Selected place:', place);
            console.log('Selected place:', place.geometry?.location?.lat());

            if (place.geometry?.location) {
                setData({
                    ...data,
                    location: place.formatted_address || place.name || '',
                    location_latitude: place.geometry.location.lat(),
                    location_longitude: place.geometry.location.lng(),
                });
            }
        }
    };

    // Set high z-index on Google's pac-container so it appears above the dialog
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .pac-container {
                z-index: 10000 !important;
                pointer-events: auto !important;
            }
            .pac-item {
                cursor: pointer !important;
                pointer-events: auto !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/admin/events', {
            onSuccess: () => {
                reset();
                setOpen(false); // Close dialog on success
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-h-[90vh] max-w-2xl overflow-y-auto"
                onInteractOutside={(e) => {
                    // Prevent dialog from closing when clicking on Google Places autocomplete
                    const target = e.target as HTMLElement;
                    if (target.closest('.pac-container')) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                        Add a new event to your calendar. Fill in the details
                        below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Event Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g., Annual Tech Conference"
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Brief description of the event..."
                                className="min-h-[100px]"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData('date', e.target.value)
                                    }
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {errors.date && (
                                    <p className="text-sm text-red-600">
                                        {errors.date}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time_from">
                                    Start Time (24h)
                                </Label>
                                <Input
                                    id="time_from"
                                    type="text"
                                    value={data.time_from}
                                    onChange={(e) =>
                                        setData('time_from', e.target.value)
                                    }
                                    placeholder="e.g., 09:00"
                                    pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                                    required
                                />
                                {errors.time_from && (
                                    <p className="text-sm text-red-600">
                                        {errors.time_from}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time_to">End Time (24h)</Label>
                                <Input
                                    id="time_to"
                                    type="text"
                                    value={data.time_to}
                                    onChange={(e) =>
                                        setData('time_to', e.target.value)
                                    }
                                    placeholder="e.g., 17:00"
                                    pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                                    required
                                />
                                {errors.time_to && (
                                    <p className="text-sm text-red-600">
                                        {errors.time_to}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            {isLoaded && (
                                <Autocomplete
                                    onLoad={(autocomplete) => {
                                        autocompleteRef.current = autocomplete;
                                    }}
                                    onPlaceChanged={onPlaceChanged}
                                    options={{
                                        types: ['establishment', 'geocode'],
                                        // Optionally restrict to a country:
                                        // componentRestrictions: { country: 'us' },
                                    }}
                                >
                                    <Input
                                        id="location"
                                        ref={locationInputRef}
                                        value={data.location}
                                        onChange={(e) => {
                                            setData('location', e.target.value);
                                        }}
                                        onKeyDown={(e) => {
                                            // Prevent form submission when autocomplete dropdown is visible
                                            if (
                                                e.key === 'Enter' &&
                                                isPacContainerVisible()
                                            ) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}
                                        placeholder="Search for a location..."
                                        required
                                    />
                                </Autocomplete>
                            )}
                            {errors.location && (
                                <p className="text-sm text-red-600">
                                    {errors.location}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="required_staff_count">
                                Number of Staff Required
                            </Label>
                            <Input
                                id="required_staff_count"
                                value={data.required_staff_count}
                                onChange={(e) =>
                                    setData(
                                        'required_staff_count',
                                        parseInt(e.target.value) || 1,
                                    )
                                }
                                type="number"
                                min="1"
                                placeholder="e.g., 10"
                                required
                            />
                            {errors.required_staff_count && (
                                <p className="text-sm text-red-600">
                                    {errors.required_staff_count}
                                </p>
                            )}
                        </div>

                        {/* Hidden status field */}
                        <input type="hidden" value="new" />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
