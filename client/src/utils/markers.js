import L from 'leaflet';

/**
 * Creates custom divIcon markers avoiding broken default Leaflet assets in Vite builds.
 * Uses SVG and CSS classes to color markers according to issue status.
 */
export const createStatusIcon = (status = 'open') => {
    const statusClass = status === 'resolved' ? 'resolved' : status === 'in_progress' ? 'in_progress' : 'open';

    // SVG mini icon inside marker
    const iconSvg =
        status === 'resolved'
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
            : status === 'in_progress'
                ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
                : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

    return L.divIcon({
        className: 'custom-pin-marker',
        html: `
        <div class="custom-pin-bubble ${statusClass}">
            <div class="custom-pin-inner">
                ${iconSvg}
            </div>
        </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
    });
};

/**
 * Custom pulsing marker for pin-drop selection mode.
 */
export const createSelectionIcon = () => {
    return L.divIcon({
        className: 'custom-pin-marker',
        html: `
        <div class="custom-pin-bubble pulse" style="background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);">
            <div class="custom-pin-inner">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="4"/>
                </svg>
            </div>
        </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
    });
};
