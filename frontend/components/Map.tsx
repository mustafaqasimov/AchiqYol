"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
export type Place = {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  reviewCount: number;
  color: string;
};
const colors: Record<string, string> = {
  GREEN: "#167344",
  YELLOW: "#946000",
  RED: "#b42318",
  GREY: "#626b73",
};
export default function Map({
  places,
  onSelect,
}: {
  places: Place[];
  onSelect?: (id: number) => void;
}) {
  return (
    <MapContainer center={[40.4093, 49.8671]} zoom={12} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.latitude, p.longitude]}
          eventHandlers={{ click: () => onSelect?.(p.id) }}
          radius={12}
          pathOptions={{ color: colors[p.color], fillOpacity: 0.8 }}
        >
          <Popup>
            <strong>{p.name}</strong>
            <p>{p.description}</p>
            <p>{p.rating ?? "Rəy yoxdur"}</p>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
