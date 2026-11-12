// Data shapes shared by the services and pages (from the build guide's data model).

export const CATEGORIES = ['Maintenance', 'Safety', 'IT and network', 'Grounds'] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ['New', 'In review', 'In progress', 'Resolved'] as const;
export type Status = (typeof STATUSES)[number];

export type Urgency = 'Low' | 'Medium' | 'Urgent';

export interface LatLng {
  lat: number;
  lng: number;
}

/** One entry in src/assets/neust-buildings.json. */
export interface Building {
  no: number;
  name: string;
  /** Shorter name for compact places, e.g. "Science & Tech Bldg". */
  shortName?: string;
  category: string | null;
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
