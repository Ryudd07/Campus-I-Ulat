import { findBuilding } from './geo';
import type { Report, Status } from './models';

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): number {
  const c = new Date(d.getTime());
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

function daysBetween(d: Date, now = new Date()): number {
  return Math.round((startOfDay(now) - startOfDay(d)) / DAY);
}

function clockTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** "just now", "20 min ago", "today", "yesterday", "3 days ago", "last week". */
export function ago(input: Date | string, now = new Date()): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const mins = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const days = daysBetween(d, now);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'last week';
  return `${Math.floor(days / 7)} weeks ago`;
}

/** Timeline stamp: "Today, 8:15 AM", "Yesterday, 4:30 PM", "Mon, 9:12 AM", "3 Nov". */
export function stamp(input: Date | string, now = new Date()): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const days = daysBetween(d, now);
  if (days <= 0) return `Today, ${clockTime(d)}`;
  if (days === 1) return `Yesterday, ${clockTime(d)}`;
  if (days < 7) return `${d.toLocaleDateString('en-US', { weekday: 'short' })}, ${clockTime(d)}`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function statusClass(status: Status | string): string {
  return status.toLowerCase().replace(/\s+/g, '-');
}

/** "Science & Tech Bldg (29), 2nd floor" */
export function placeLong(r: Report): string {
  const b = findBuilding(r.buildingNo);
  // Placeholder names ("Building 8") would repeat the number.
  const named = b && !/^Building \d+$/.test(b.name);
  const head = named ? `${b.shortName ?? b.name} (${r.buildingNo})` : `Bldg ${r.buildingNo}`;
  return r.room ? `${head}, ${r.room}` : head;
}

/** "Bldg 29 · 2nd floor" */
export function placeShort(r: Report): string {
  return [`Bldg ${r.buildingNo}`, r.room].filter(Boolean).join(' · ');
}
