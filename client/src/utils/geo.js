/**
 * Client Geographical Utilities
 *
 * Leaflet format: [latitude, longitude]
 * GeoJSON Point format: [longitude, latitude]
 */

// Default center: Bengaluru, Karnataka, India
export const DEFAULT_MAP_CENTER = [12.9716, 77.5946];
export const DEFAULT_MAP_ZOOM = 13;

/**
 * Converts GeoJSON coordinates [lng, lat] to Leaflet coordinates [lat, lng].
 */
export const toLeafletCoords = (coords) => {
    if (!coords || !Array.isArray(coords) || coords.length < 2) {
        return DEFAULT_MAP_CENTER;
    }
    const [lng, lat] = coords;
    return [Number(lat), Number(lng)];
};

/**
 * Converts Leaflet coordinates [lat, lng] or {lat, lng} to GeoJSON [lng, lat].
 */
export const toGeoJSONCoords = (input) => {
    if (Array.isArray(input)) {
        const [lat, lng] = input;
        return [Number(lng), Number(lat)];
    }
    if (input && typeof input === 'object') {
        const lat = input.lat !== undefined ? input.lat : input.latitude;
        const lng = input.lng !== undefined ? input.lng : input.longitude;
        return [Number(lng), Number(lat)];
    }
    return [DEFAULT_MAP_CENTER[1], DEFAULT_MAP_CENTER[0]];
};

/**
 * Formats coordinates for friendly display (e.g. 12.9716° N, 77.5946° E)
 */
export const formatCoordinates = (coords) => {
    if (!coords) return 'Location not specified';
    let lat, lng;
    if (Array.isArray(coords)) {
        // Check if it's [lng, lat] (GeoJSON) or [lat, lng]
        // In GeoJSON, coords[0] is lng (~77.5), coords[1] is lat (~12.9)
        if (Math.abs(coords[0]) > 90) {
            [lng, lat] = coords;
        } else {
            [lat, lng] = coords;
        }
    } else if (coords.lat !== undefined) {
        lat = coords.lat;
        lng = coords.lng;
    } else {
        return 'Invalid coordinates';
    }

    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';

    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
};
