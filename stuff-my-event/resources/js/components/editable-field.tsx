'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';

interface EditableFieldProps {
    value: string;
    onSave: (value: string) => void;
    label?: string;
    multiline?: boolean;
    className?: string;
}

export function EditableField({
    value,
    onSave,
    label,
    multiline = false,
    className = '',
}: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isHovered, setIsHovered] = useState(false);

    const handleSave = () => {
        onSave(editValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={`space-y-2 ${className}`}>
                {label && (
                    <p className="text-sm text-muted-foreground">{label}</p>
                )}
                {multiline ? (
                    <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="min-h-[100px]"
                        autoFocus
                    />
                ) : (
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                        }}
                    />
                )}
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                        <Check className="mr-1 h-4 w-4" />
                        Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`group relative ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label && (
                <p className="mb-1 text-sm text-muted-foreground">{label}</p>
            )}
            <div className="flex items-start gap-2">
                <p
                    className={`${multiline ? '' : 'font-medium'} flex-1 text-foreground`}
                >
                    {value}
                </p>
                {isHovered && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => setIsEditing(true)}
                    >
                        <Pencil className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );
}
