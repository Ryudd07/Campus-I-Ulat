// Domain types for Campus Care, following the data model in the build guide.

export const CATEGORIES = ['Maintenance', 'Safety', 'IT and network', 'Grounds'] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ['New', 'In review', 'In progress', 'Resolved'] as const;
export type Status = (typeof STATUSES)[number];

/** Shown in this order on the urgency buttons. */
export const URGENCIES = ['Low', 'Medium', 'Urgent'] as const;
export type Urgency = (typeof URGENCIES)[number];

export const BUILDING_CATEGORIES = [
  'Administration',
  'Canteens, gyms and halls',
  'Sports and cultural',
  'Chapel, infirmary and student development',
  'Science and technology',
  'Colleges',
] as const;
export type BuildingCategory = (typeof BUILDING_CATEGORIES)[number];

export interface LatLng {
  lat: number;
  lng: number;
}

/** One entry in neust-buildings.json. */
export interface Building {
  no: number;
  name: string;
  /** Shorter name for compact places, e.g. "Science & Tech Bldg". */
  shortName?: string;
  category: BuildingCategory | null;
  lat: number | null;
  lng: number | null;
}

export interface HistoryEntry {
  status: Status;
  at: string;
  note?: string;
}

export interface Report {
  id: string; // 'r_' + Date.now()
  title: string;
  category: Category;
  urgency: Urgency;
  status: Status;
  buildingNo: number; // 1 to 53, key into neust-buildings.json
  room: string; // '' when left empty
  lat: number; // pin position
  lng: number;
  description: string;
  photo?: string; // base64 data URL, quality 50, width 800
  createdAt: string; // ISO
  updatedAt: string; // ISO, changes on any status or note edit
  history: HistoryEntry[];
  reopened?: boolean;
  confirmedAt?: string; // set when the student taps "Yes, it is fixed"
}

/** What the student has filled in on New report so far (kept in memory only). */
export interface ReportForm {
  category: Category;
  buildingNo: number | null;
  description: string;
  photo?: string;
  lat: number;
  lng: number;
  /** The pin came from Geolocation (shows the accuracy circle). */
  located: boolean;
  accuracy?: number;
}
