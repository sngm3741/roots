import type { PageData } from "../types/profile";
import kirikoProfile from "./pages/kiriko/profile.json";
import kirikoBlogLinks from "./pages/kiriko/blog.json";
import kirikoVideoLinks from "./pages/kiriko/video.json";
import kirikoEvents from "./pages/kiriko/events.json";
import type { EventItem, EventMaster } from "../types/profile";

const buildEventItems = (masters: EventMaster[]): EventItem[] => {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const parseSortKey = (raw: string) => {
    if (raw.includes("㊙️")) {
      const month = Number(raw.split("/")[0]);
      return Number.isFinite(month) ? 2026 * 10000 + month * 100 + 31 : 0;
    }
    const [datePart] = raw.split(" ");
    const [year, month, day] = datePart.split("/").map(Number);
    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
    ) {
      return year * 10000 + month * 100 + day;
    }
    return 0;
  };
  const getNearestSortKey = (dates: string[]) =>
    dates.reduce((min, date) => Math.min(min, parseSortKey(date)), Infinity);
  const formatEventDate = (raw: string) => {
    const [datePart, timePart] = raw.split(" ");
    const [year, month, day] = datePart.split("/").map(Number);
    const weekday =
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
        ? weekdays[new Date(year, month - 1, day).getDay()]
        : "";
    const startTime = timePart ? timePart.split("-")[0] : "";
    const shortDate =
      Number.isFinite(month) && Number.isFinite(day)
        ? `${month}/${day}`
        : datePart;
    return `${shortDate}${weekday ? `(${weekday})` : ""}${
      startTime ? ` ${startTime}` : ""
    }`;
  };
  return [...masters]
    .sort((a, b) => {
      const aKey = getNearestSortKey(a.dates ?? []);
      const bKey = getNearestSortKey(b.dates ?? []);
      return aKey - bKey;
    })
    .map((master) => ({
      id: master.id,
      title: master.title,
      dates: (master.dates ?? []).map(formatEventDate),
      reservationRequired: master.reservationRequired,
      linkUrl: master.linkUrl,
    }));
};

const kirikoEventItems = buildEventItems(kirikoEvents as EventMaster[]);

const pages: PageData[] = [
  {
    profile: kirikoProfile as PageData["profile"],
    links: [
      ...(kirikoBlogLinks as PageData["links"]).map((link) => ({
        ...link,
        category: "blog",
      })),
      ...(kirikoVideoLinks as PageData["links"]).map((link) => ({
        ...link,
        category: "video",
      })),
    ],
    optional: {
      type: "event",
      enabled: kirikoEventItems.length > 0,
      dataByType: {
        event: { items: kirikoEventItems },
      },
    },
  },
];
const pageBySlug = new Map(pages.map((page) => [page.profile.slug, page]));

export const getPageBySlug = async (slug: string) =>
  pageBySlug.get(slug) ?? null;
