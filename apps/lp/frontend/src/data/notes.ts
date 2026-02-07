const parseFrontmatter = (raw: string) => {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) {
    return { data: {}, content: raw };
  }

  const end = trimmed.indexOf("\n---");
  if (end === -1) {
    return { data: {}, content: raw };
  }

  const frontmatterBlock = trimmed.slice(3, end).trim();
  const content = trimmed.slice(end + 4).trimStart();
  const data: Record<string, string | string[]> = {};

  for (const line of frontmatterBlock.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    if (key === "tags") {
      const tags = value
        .split(/[, ]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.replace(/^#/, ""));
      data[key] = tags;
      continue;
    }
    data[key] = value;
  }

  return { data, content };
};

export type NoteMeta = {
  slug: string;
  title: string;
  date: string;
  author: string;
  site: string;
  siteUrl: string;
  category: "writing" | "release" | "misc";
  summary: string;
  displayDate: string;
  tags: string[];
};

export type Note = {
  meta: NoteMeta;
  content: string;
};

const noteModules = import.meta.glob("../notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const notes: Note[] = Object.entries(noteModules).map(([path, raw]) => {
  const slugFromPath = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
  const parsed = parseFrontmatter(String(raw));
  const data = parsed.data as Partial<NoteMeta>;
  const slug = data.slug ?? slugFromPath;

  return {
    meta: {
      slug,
      title: data.title ?? "",
      date: data.date ?? "",
      author: data.author ?? "",
      site: data.site ?? "",
      siteUrl: data.siteUrl ?? "",
      category: (data.category as NoteMeta["category"]) ?? "writing",
      summary: data.summary ?? "",
      displayDate: data.displayDate ?? data.date ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
    },
    content: parsed.content,
  };
});

const sortedNotes = notes.sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1));

export const getNoteBySlug = (slug: string) => sortedNotes.find((note) => note.meta.slug === slug);

export const getNotesByCategory = (category: NoteMeta["category"]) =>
  sortedNotes.filter((note) => note.meta.category === category);

export default sortedNotes;
