import type { SocialKind } from "~/types/profile";

const toDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const X_ICON = toDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227"><circle cx="600" cy="613.5" r="600" fill="#000000"/><path fill="#ffffff" d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg>`,
);

const BLUESKY_ICON = toDataUri(
  `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="600" height="530" viewBox="0 0 600 530"><path fill="#1185fe" d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/></svg>`,
);

const SOCIAL_ICON_MAP: Record<SocialKind, string> = {
  x: X_ICON,
  bluesky: BLUESKY_ICON,
};

export const getSocialIconUrl = (kind?: SocialKind) =>
  kind ? SOCIAL_ICON_MAP[kind] : undefined;
