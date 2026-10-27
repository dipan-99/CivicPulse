import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { toLeafletCoords, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../utils/geo';
import { createStatusIcon, createSelectionIcon } from '../utils/markers';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import { ThumbsUp, ArrowRight } from 'lucide-react';

// Subcomponent to trigger Leaflet invalidateSize on mount to ensure tiles render
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Initial invalidate
    map.invalidateSize();
    // Subsequent timers to guarantee size calculation after flex/grid paint
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

// Subcomponent to handle map clicks for dropping a pin
function LocationPickerHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

// Subcomponent to adjust map center when center prop changes
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function IssueMap({
  issues = [],
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  height = '100%',
  className = '',
  selectable = false,
  selectedLocation = null,
  onLocationSelect = null,
  singleIssueMode = false,
  zoomControlPosition = 'bottomright',
}) {
  return (
    <div
      className={`relative w-full h-full min-h-[400px] overflow-hidden ${className}`}
      style={{ height: height || '100%', minHeight: '400px' }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[400px] z-0"
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        <ZoomControl position={zoomControlPosition} />
        <MapResizer />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapRecenter center={center} zoom={zoom} />

        {/* Pin Drop Click Listener */}
        {selectable && <LocationPickerHandler onLocationSelect={onLocationSelect} />}

        {/* Dropped / Selected Pin Marker */}
        {selectable && selectedLocation && (
          <Marker position={selectedLocation} icon={createSelectionIcon()}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-bold text-xs text-indigo-700">Selected Location</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lat: {selectedLocation[0].toFixed(4)}, Lng: {selectedLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Regular Issue Markers */}
        {!singleIssueMode &&
          issues.map((issue) => {
            const coords = toLeafletCoords(issue.location?.coordinates);
            const upvotesCount = Array.isArray(issue.upvotes)
              ? issue.upvotes.length
              : issue.upvotesCount || 0;

            return (
              <Marker
                key={issue._id}
                position={coords}
                icon={createStatusIcon(issue.status)}
              >
                <Popup className="civic-popup">
                  <div className="w-56 space-y-2 p-1">
                    <div className="flex items-center justify-between gap-1">
                      <CategoryBadge category={issue.category} size="xs" />
                      <StatusBadge status={issue.status} size="xs" />
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {issue.title}
                    </h4>

                    {issue.imageUrl && (
                      <div className="w-full h-24 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={issue.imageUrl}
                          alt={issue.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <ThumbsUp className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{upvotesCount} upvotes</span>
                      </span>

                      <Link
                        to={`/issues/${issue._id}`}
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Single Issue Mode */}
        {singleIssueMode && issues[0] && (
          <Marker
            position={toLeafletCoords(issues[0].location?.coordinates)}
            icon={createStatusIcon(issues[0].status)}
          >
            <Popup>
              <div className="p-1 space-y-1">
                <StatusBadge status={issues[0].status} size="xs" />
                <p className="font-bold text-xs text-slate-900 mt-1">{issues[0].title}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
