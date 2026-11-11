"use client";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
export type Place = {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  reviewCount: number;
  color: string;
  assessmentSource?: string;
};
const colors: Record<string, string> = {
  GREEN: "#167344",
  YELLOW: "#946000",
  RED: "#b42318",
  GREY: "#626b73",
};
function Focus({
  places,
  selected,
}: {
  places: Place[];
  selected?: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    const p = places.find((p) => p.id === selected);
    if (p) map.setView([p.latitude, p.longitude], 16);
  }, [map, places, selected]);
  return null;
}
export default function Map({
  places,
  onSelect,
  selected,
}: {
  places: Place[];
  onSelect?: (id: number) => void;
  selected?: number | null;
}) {
  return (
    <MapContainer center={[40.4093, 49.8671]} zoom={12} scrollWheelZoom={false}>
      <Focus places={places} selected={selected} />
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
            <p>
              {p.assessmentSource === "AI"
                ? "İlkin AI qiymətləndirməsi · audit deyil"
                : (p.rating ?? "Rəy yoxdur")}
            </p>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
