
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format, isToday, isThisWeek, isThisYear } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  snippet: string;
  date: Date;
  read: boolean;
}

interface EmailListItemProps {
  email: Email;
  onSelect: (email: Email) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function EmailListItem({ email, onSelect, isFirst, isLast }: EmailListItemProps) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const formatDate = (date: Date) => {
      if (isToday(date)) {
        return format(date, 'p', { locale: es });
      }
      if (isThisWeek(date, { weekStartsOn: 1 })) {
        return format(date, 'E', { locale: es });
      }
      if (isThisYear(date)) {
        return format(date, 'd MMM', { locale: es });
      }
      return format(date, 'dd/MM/yyyy', { locale: es });
    };
    setFormattedDate(formatDate(email.date));
  }, [email.date]);

  return (
    <button
      onClick={() => onSelect(email)}
      className={cn(
        "w-full text-left p-4 grid grid-cols-[auto,1fr,auto] items-center gap-4 transition-colors",
        "hover:bg-primary/10 dark:hover:bg-primary/20",
        !isLast && "border-b border-border/10 dark:border-border/30",
        isFirst && "rounded-t-lg",
        isLast && "rounded-b-lg",
        !email.read && "bg-primary/5 dark:bg-primary/10"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-2 h-2 rounded-full", !email.read ? "bg-primary" : "bg-transparent")} />
        {/* Placeholder for checkbox */}
        <div className="w-4 h-4 rounded border-2 border-muted-foreground/50" />
      </div>
      
      <div className="grid grid-cols-[150px,1fr] gap-4 truncate">
         <p className={cn("font-semibold truncate", !email.read && "text-foreground")}>{email.from}</p>
         <div className="flex items-baseline gap-2 truncate">
            <p className={cn("text-sm font-semibold truncate", !email.read && "text-foreground")}>{email.subject}</p>
            <p className="text-sm text-muted-foreground truncate hidden md:inline-block">- {email.snippet}</p>
         </div>
      </div>

      <p className={cn("text-xs shrink-0", !email.read ? "text-primary font-bold" : "text-muted-foreground")}>
        {formattedDate}
      </p>
    </button>
  );
}

    