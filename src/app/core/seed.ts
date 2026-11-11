// Sample reports copied from the design canvas.
// They are written to Preferences on first launch, with at least one in each
// status, because nothing in the app moves a report along: they show the status flow.
import { offsetFromCenter } from './geo';
import type { HistoryEntry, Report, Status } from './models';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** ISO time `daysAgo` days back at a clock time. */
function at(daysAgo: number, hours: number, minutes = 0): string {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function minsAgo(m: number): string {
  return new Date(Date.now() - m * MIN).toISOString();
}

function history(...steps: [Status, string, string?][]): HistoryEntry[] {
  return steps.map(([status, when, note]) => (note ? { status, at: when, note } : { status, at: when }));
}

export function seedReports(): Report[] {
  const light = minsAgo(10);
  const wifi = minsAgo(5);
  return [
    {
      id: 'r_seed_new',
      title: 'Overflowing bin by the cafeteria',
      category: 'Grounds',
      urgency: 'Low',
      status: 'New',
      buildingNo: 8,
      room: 'Main entrance',
      ...offsetFromCenter(110, 60),
      description: 'The bin at the main entrance is full and rubbish is on the ground.',
      createdAt: minsAgo(20),
      updatedAt: minsAgo(20),
      history: history(['New', minsAgo(20)]),
    },
    {
      id: 'r_seed_review',
      title: 'Leaking sink',
      category: 'Maintenance',
      urgency: 'Medium',
      status: 'In review',
      buildingNo: 51,
      room: 'Room 214',
      ...offsetFromCenter(-120, -40),
      description: 'The sink under the window drips constantly and the cabinet below is wet.',
      createdAt: at(1, 16, 5),
      updatedAt: at(1, 9, 30),
      history: history(['New', at(1, 16, 5)], ['In review', at(1, 9, 30)]),
    },
    {
      id: 'r_seed_progress',
      title: 'Broken light in stairwell B',
      category: 'Maintenance',
      urgency: 'Urgent',
      status: 'In progress',
      buildingNo: 29,
      room: '2nd floor',
      ...offsetFromCenter(20, 40),
      description: 'The stairwell light keeps flickering and goes out.',
      createdAt: at(2, 9, 12),
      updatedAt: light,
      history: history(
        ['New', at(2, 9, 12)],
        ['In review', at(2, 11, 40)],
        ['In progress', light, 'An electrician is booked for Thursday morning.'],
      ),
    },
    {
      id: 'r_seed_resolved',
      title: 'Wi-Fi dead zone',
      category: 'IT and network',
      urgency: 'Low',
      status: 'Resolved',
      buildingNo: 39,
      room: 'Reading room',
      ...offsetFromCenter(150, -30),
      description: 'The Wi-Fi drops every few minutes in the reading room.',
      createdAt: at(3, 14, 5),
      updatedAt: wifi,
      history: history(
        ['New', at(3, 14, 5)],
        ['In review', at(3, 16, 30)],
        ['In progress', at(2, 10, 0)],
        ['Resolved', wifi, 'The access point was replaced. Please let us know if the signal is still weak.'],
      ),
    },
    {
      id: 'r_seed_closed',
      title: 'Broken door lock',
      category: 'Maintenance',
      urgency: 'Medium',
      status: 'Resolved',
      buildingNo: 3,
      room: 'Room 105',
      ...offsetFromCenter(-60, 130),
      description: 'The lock on the classroom door does not catch.',
      createdAt: at(12, 10, 20),
      updatedAt: at(9, 15, 45),
      history: history(
        ['New', at(12, 10, 20)],
        ['In review', at(12, 13, 0)],
        ['In progress', at(11, 9, 0)],
        ['Resolved', at(9, 15, 45)],
      ),
      confirmedAt: at(8, 10, 0),
    },
  ];
}
