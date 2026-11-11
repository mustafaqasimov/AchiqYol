import type { CSSProperties } from "react";
const paths: Record<string, React.ReactNode> = {
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  map: (
    <>
      <path d="m3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3zM9 2v17M15 5v17" />
    </>
  ),
  list: (
    <>
      <path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />,
  minus: <path d="M4 12h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
    </>
  ),
  access: (
    <>
      <circle cx="13" cy="3" r="1" />
      <path d="m12 6-2 7h7l4 7M11 9h6M7 10a6 6 0 1 0 8 9" />
    </>
  ),
  filter: (
    <>
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="8" cy="18" r="2" />
    </>
  ),
  star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />,
  bookmark: <path d="M6 3h12v19l-6-4-6 4z" />,
  route: (
    <>
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="5" r="2" />
      <path d="M5 17V7a3 3 0 0 1 6 0v10a3 3 0 0 0 6 0V7" />
    </>
  ),
  flag: <path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0" />,
  check: <path d="m4 12 5 5L20 6" />,
  locate: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
    </>
  ),
  audio: (
    <>
      <path d="M11 4 5 9H2v6h3l6 5zM16 7a7 7 0 0 1 0 10M19 3a12 12 0 0 1 0 18" />
    </>
  ),
  arrow: <path d="m9 5 7 7-7 7" />,
};
export default function Icon({
  name,
  style,
}: {
  name: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      style={style}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.pin}
    </svg>
  );
}
