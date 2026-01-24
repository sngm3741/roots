import type { PageData } from "../types/profile";
import kiriko from "./pages/kiriko.json";

const pages: PageData[] = [kiriko as PageData];
const pageBySlug = new Map(pages.map((page) => [page.profile.slug, page]));

export const getPageBySlug = async (slug: string) =>
  pageBySlug.get(slug) ?? null;
