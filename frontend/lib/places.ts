export type Place = {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  reviewCount: number;
  color: string;
  assessmentSource?: "AI" | "COMMUNITY" | "UNRATED";
  aiSummary?: string;
};
export const labels: Record<string, string> = {
  GREEN: "Tam əlçatan",
  YELLOW: "Qismən əlçatan",
  RED: "Maneələr var",
  GREY: "Audit gözlənilir",
};
export const demoPlaces: Place[] = [
  {
    id: 1,
    name: "Şəhər Mərkəzi Aptek",
    description:
      "Dizayn nümunəsi: geniş giriş və pandus haqqında nümunə məlumat. Real əlçatanlıq yoxlanılmayıb.",
    latitude: 40.405,
    longitude: 49.86,
    rating: 4.8,
    reviewCount: 24,
    color: "GREEN",
  },
  {
    id: 2,
    name: "Baku Roasters Cafe",
    description:
      "Dizayn nümunəsi: girişdə kömək tələb oluna bilər. Real məkan haqqında təsdiqlənmiş məlumat deyil.",
    latitude: 40.412,
    longitude: 49.87,
    rating: 3.5,
    reviewCount: 12,
    color: "YELLOW",
  },
  {
    id: 3,
    name: "Köhnə Şəhər Bank Filialı",
    description:
      "Dizayn nümunəsi: pilləkənli giriş. Real əlçatanlıq yoxlanılmayıb.",
    latitude: 40.399,
    longitude: 49.875,
    rating: 1.5,
    reviewCount: 5,
    color: "RED",
  },
  {
    id: 4,
    name: "Mərkəzi Park",
    description: "Dizayn nümunəsi: əlçatanlıq haqqında məlumat gözlənilir.",
    latitude: 40.401,
    longitude: 49.85,
    rating: null,
    reviewCount: 0,
    color: "GREY",
  },
];
