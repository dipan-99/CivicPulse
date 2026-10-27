/**
 * Dedicated Geo coordinate conversion helper.
 *
 * Rules:
 * - GeoJSON format stores: [longitude, latitude]
 * - Leaflet format stores: [latitude, longitude]
 */

/**
 * Converts Leaflet [lat, lng] or {lat, lng} to GeoJSON Point coordinates [lng, lat].
 */
const toGeoJSONCoordinates = (input) => {
    if (Array.isArray(input)) {
        const [lat, lng] = input;
        return [Number(lng), Number(lat)];
    }
    if (input && typeof input === 'object') {
        const lat = input.lat !== undefined ? input.lat : input.latitude;
        const lng = input.lng !== undefined ? input.lng : input.longitude;
        return [Number(lng), Number(lat)];
    }
    throw new Error('Invalid coordinate input for toGeoJSONCoordinates');
};

/**
 * Converts GeoJSON [lng, lat] coordinates to Leaflet [lat, lng].
 */
const toLeafletCoordinates = (coords) => {
    if (!Array.isArray(coords) || coords.length !== 2) {
        throw new Error('Coordinates must be an array of length 2 [lng, lat]');
    }
    const [lng, lat] = coords;
    return [Number(lat), Number(lng)];
};

/**
 * Validates whether longitude and latitude are in valid ranges.
 */
const isValidLatLng = (lat, lng) => {
    const latitude = Number(lat);
    const longitude = Number(lng);
    return (
        !isNaN(latitude) &&
        !isNaN(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
};

module.exports = {
    toGeoJSONCoordinates,
    toLeafletCoordinates,
    isValidLatLng
};
