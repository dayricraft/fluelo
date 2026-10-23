import type { SVGProps } from "react";

export type IconName =
  | "arrow-left"
  | "arrow-right"
  | "award"
  | "bar-chart"
  | "book-open"
  | "check"
  | "chevron-down"
  | "clock"
  | "filter"
  | "flame"
  | "headphones"
  | "help-circle"
  | "history"
  | "home"
  | "lightbulb"
  | "lock"
  | "message-square"
  | "mic"
  | "mic-off"
  | "phone-off"
  | "play"
  | "repeat"
  | "rotate"
  | "search"
  | "settings"
  | "shield"
  | "sparkles"
  | "star"
  | "target"
  | "trending-up"
  | "user"
  | "volume"
  | "x"
  | "zap";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, className = "size-5", ...props }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    "arrow-left": <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
    "arrow-right": <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>,
    "bar-chart": <><path d="M4 19V9" /><path d="M10 19V5" /><path d="M16 19v-7" /><path d="M22 19H2" /></>,
    "book-open": <><path d="M2.5 5.5A3.5 3.5 0 0 1 6 2h5v18H6a3.5 3.5 0 0 0-3.5 3.5z" /><path d="M21.5 5.5A3.5 3.5 0 0 0 18 2h-5v18h5a3.5 3.5 0 0 1 3.5 3.5z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    "chevron-down": <path d="m6 9 6 6 6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M18 13h2v5h-3a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2Z" /><path d="M6 13H4v5h3a1 1 0 0 0 1-1v-2a2 2 0 0 0-2-2Z" /></>,
    "help-circle": <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    lightbulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.5 1.4-1.5 2.5h-4c0-1.1-.6-1.8-1.5-2.5Z" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    "message-square": <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 17v5" /></>,
    "mic-off": <><path d="m3 3 18 18" /><path d="M9 6v4a3 3 0 0 0 4.8 2.4" /><path d="M15 9V5a3 3 0 0 0-5.1-2.1" /><path d="M5 10a7 7 0 0 0 11.7 5.2" /><path d="M19 10a7 7 0 0 1-.5 2.6" /><path d="M12 17v5" /></>,
    "phone-off": <><path d="m3 3 18 18" /><path d="M6.6 10.8c1.7 3.2 3.8 5.3 7 7l2.3-2.3c.4-.4.9-.5 1.4-.3l2.9 1.2c.5.2.8.7.8 1.2V21c0 .6-.4 1-1 1C10.1 22 2 13.9 2 4c0-.6.4-1 1-1h3.4c.5 0 1 .3 1.2.8l1.2 2.9c.2.5.1 1-.3 1.4Z" /></>,
    play: <path d="m8 5 11 7-11 7Z" />,
    repeat: <><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
    rotate: <><path d="M20 7h-5V2" /><path d="M20 7a9 9 0 1 0 1 8" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />,
    sparkles: <><path d="m12 3-1 3.2A7 7 0 0 1 6.2 11L3 12l3.2 1A7 7 0 0 1 11 17.8l1 3.2 1-3.2A7 7 0 0 1 17.8 13l3.2-1-3.2-1A7 7 0 0 1 13 6.2Z" /></>,
    star: <path d="m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.9-6.2-3.2L5.8 21 7 14.1 2 9.3l6.9-1Z" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    "trending-up": <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 22a8 8 0 0 1 16 0" /></>,
    volume: <><path d="M11 5 6 9H2v6h4l5 4Z" /><path d="M15 9a4 4 0 0 1 0 6" /><path d="M18 6a8 8 0 0 1 0 12" /></>,
    x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
