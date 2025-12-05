"use client";

import { formatInTimeZone } from "date-fns-tz";

interface TimezoneDisplayProps {
  utcDate: Date;
  showTimezone?: boolean;
  className?: string;
}

export default function TimezoneDisplay({
  utcDate,
  showTimezone = true,
  className = "",
}: TimezoneDisplayProps) {
  // Get user's local timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Format the date in the user's local timezone
  const localDate = formatInTimeZone(utcDate, userTimezone, "PPpp");
  const timezoneAbbr = formatInTimeZone(utcDate, userTimezone, "zzz");
  
  return (
    <span className={className}>
      {localDate}
      {showTimezone && (
        <span className="text-slate-400 ml-2">({timezoneAbbr})</span>
      )}
    </span>
  );
}

