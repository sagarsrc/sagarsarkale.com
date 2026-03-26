import fs from "fs";
import path from "path";
import { parse } from "yaml";

export interface ChangelogEntry {
  title: string;
  date: string;
  tag: "feature" | "fix" | "improvement";
  status?: "roadmap";
  description: string;
  context?: string;
  image?: string;
}

export function getChangelogEntries(): ChangelogEntry[] {
  const dir = path.join(process.cwd(), "config/changelog");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  const entries = files.map((file) => {
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    return parse(content) as ChangelogEntry;
  });
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
