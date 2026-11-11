import * as L from 'leaflet'; // Importing everything from leaflet + aliasing

export { L };

// Adds the OpenStreetMap tiles (the actual "map") with the required attribution
export function addTiles(map: L.Map) {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
    keepBuffer: 0, // no tile prefetching outside the visible area
  }).addTo(map);
}

// Numbered building marker
export function buildingIcon(no: number, selected = false) {
  return L.divIcon({
    className: selected ? 'cc-map-building cc-map-building--on' : 'cc-map-building',
    html: '<span>' + no + '</span>',
    iconSize: [32, 32],
  });
}

// The draggable report pin (its tip sits on the point)
export function pinIcon() {
  return L.divIcon({
    className: 'cc-map-pin',
    html:
      '<svg width="36" height="46" viewBox="0 0 36 46" aria-hidden="true">' +
      '<ellipse cx="18" cy="42" rx="8" ry="3" fill="#14202B" fill-opacity="0.3"/>' +
      '<path d="M18 42C8 30 1.5 22 1.5 12.5A16.5 16.5 0 0 1 34.5 12.5C34.5 22 28 30 18 42Z" fill="#0B5FA5" stroke="#fff" stroke-width="3"/>' +
      '<circle cx="18" cy="12.5" r="6" fill="#fff"/></svg>',
    iconSize: [44, 50],
    iconAnchor: [22, 44],
  });
}
