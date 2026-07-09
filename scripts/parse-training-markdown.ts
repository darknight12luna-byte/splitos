/**
 * Parses data-sources/training-history.md (a Perplexity-generated normalized
 * training database export) into typed JSON under src/data/training/.
 *
 * Re-run with `npm run parse:training` any time the source markdown changes.
 *
 * Policy: never invent field values. If the source doesn't provide something
 * for a given row, the output field is `null` / `[]`, not a guess.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import type {
  MediaRef,
  Exercise,
  MovementTechnique,
  WeeklyProgramDay,
  ItemKind,
  WorkoutTemplate,
  ProgressionRule,
  UnresolvedRef,
} from "../src/lib/training/types";

const SOURCE_PATH = path.join(process.cwd(), "data-sources", "training-history.md");
const OUT_DIR = path.join(process.cwd(), "src", "data", "training");

// ---------- generic markdown table parsing ----------

function extractSection(markdown: string, heading: string): string {
  const start = markdown.indexOf(`## ${heading}`);
  if (start === -1) throw new Error(`Section not found: ${heading}`);
  const rest = markdown.slice(start + heading.length + 3);
  const nextHeadingIdx = rest.search(/\n## /);
  return nextHeadingIdx === -1 ? rest : rest.slice(0, nextHeadingIdx);
}

function parseTable(sectionText: string): Record<string, string>[] {
  const lines = sectionText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (lines.length < 3) return [];

  const splitRow = (line: string) =>
    line
      .slice(1, line.endsWith("|") ? -1 : undefined)
      .split("|")
      .map((c) => c.trim());

  const headers = splitRow(lines[0]);
  const rows = lines.slice(2); // skip header + separator

  return rows.map((line) => {
    const cells = splitRow(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = cells[i] ?? "";
    });
    return record;
  });
}

function stripFootnote(s: string): string {
  return s.replace(/\s*\[\^\d+\]\s*$/, "").trim();
}

function stripBackticks(s: string): string {
  return s.replace(/^`|`$/g, "").trim();
}

function nullableOrList(s: string, splitOn: string | RegExp = ", "): string[] {
  if (!s || s.toLowerCase() === "null") return [];
  return s.split(splitOn).map((x) => x.trim()).filter(Boolean);
}

function nullableString(s: string): string | null {
  if (!s || s.toLowerCase() === "null") return null;
  return s;
}

function parseMediaCell(s: string): MediaRef | null {
  const clean = stripFootnote(s);
  if (!clean || clean.toLowerCase() === "null") return null;
  const match = clean.match(/^\[(.*?)\]\((.*?)\)/);
  if (!match) return null;
  return { title: match[1], url: match[2], source: null };
}

// underscore-joined tokens in template chains don't match the hyphenated
// catalog slugs used everywhere else in the source — normalize both ways
function normalizeSlug(s: string): string {
  return s.trim().replace(/_/g, "-");
}

// A handful of template-chain tokens refer to the same catalog item under a
// slightly different name elsewhere in the *same* source document (e.g. the
// template chain says "rowing_machine_optional" but the exercise catalog
// entry is "rowing-machine"). This is cross-referencing an existing record,
// not inventing content — every other unresolved token has no catalog match
// at all and is left flagged rather than guessed at.
const SLUG_ALIASES: Record<string, string> = {
  "rowing-machine-optional": "rowing-machine",
  "wrist-mobility": "wrist-mobilization",
  "light-jogging-optional": "light-jogging",
};

function resolveAlias(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}

// ---------- main ----------

function main() {
  const md = readFileSync(SOURCE_PATH, "utf-8");

  // 1. exercise catalog
  const exerciseRows = parseTable(extractSection(md, "Exercise catalog"));
  const exercises: Exercise[] = exerciseRows.map((r) => ({
    slug: r.slug,
    name: r.name,
    category: r.category,
    movementPattern: r.movement_pattern,
    equipment: nullableOrList(r.equipment),
    difficulty: r.difficulty,
    primaryMuscles: nullableOrList(r.primary_muscles),
    secondaryMuscles: nullableOrList(r.secondary_muscles),
    executionSteps: [],
    cues: [],
    mistakes: [],
    regressions: [],
    progressions: [],
    defaultSets: nullableString(r.default_sets),
    defaultReps: nullableString(r.default_reps),
    defaultRest: nullableString(r.default_rest),
    mediaReference: parseMediaCell(r.media_reference),
    recommendedSearchQuery: stripBackticks(r.recommended_search_query),
    coachNotes: [],
    beginnerInstructions: [],
  }));

  // 2. movement-technique catalog
  const techniqueRows = parseTable(extractSection(md, "Movement-technique catalog"));
  const techniques: MovementTechnique[] = techniqueRows.map((r) => ({
    slug: r.slug,
    name: r.name,
    techniqueType: r.technique_type,
    parentSystem: r.parent_system,
    difficulty: r.difficulty,
    whatItTrains: nullableOrList(r.what_it_trains),
    executionSteps: [],
    keyCues: nullableOrList(r.key_cues),
    commonMistakes: nullableOrList(r.common_mistakes),
    beginnerVersion: r.beginner_instruction ? [stripFootnote(r.beginner_instruction)] : [],
    progressionVersion: nullableOrList(stripFootnote(r.progression_path), "->"),
    suggestedFrequency: null,
    suggestedDose: null,
    mediaReference: parseMediaCell(r.media_reference),
    recommendedSearchQuery: stripBackticks(r.recommended_search_query),
    coachNotes: [],
  }));

  const exerciseBySlug = new Map(exercises.map((e) => [e.slug, e]));
  const techniqueBySlug = new Map(techniques.map((t) => [t.slug, t]));

  // 3. weekly structure
  const weeklyRows = parseTable(extractSection(md, "Weekly structure"));
  const weeklyProgram: WeeklyProgramDay[] = weeklyRows.map((r) => ({
    dayLabel: r.week_day,
    sessionType: r.session_type,
    goal: r.goal,
    templateSlug: r.template_slug,
    frequency: r.frequency,
    notes: nullableString(stripFootnote(r.notes)),
  }));

  // 4. workout templates
  const unresolvedMap = new Map<string, UnresolvedRef>();
  const templateRows = parseTable(extractSection(md, "Reusable workout templates"));
  const templates: WorkoutTemplate[] = templateRows.map((r) => {
    const chain = stripFootnote(r.exercise_order).split("->").map((s) => s.trim());
    const itemOrder = chain.map((raw) => {
      const slug = resolveAlias(normalizeSlug(raw));
      let kind: ItemKind;
      if (exerciseBySlug.has(slug)) kind = "exercise";
      else if (techniqueBySlug.has(slug)) kind = "technique";
      else {
        kind = "unresolved";
        const label = raw.replace(/_/g, " ").replace(/-/g, " ");
        const existing = unresolvedMap.get(slug);
        if (existing) {
          if (!existing.referencedBy.includes(r.template_slug)) {
            existing.referencedBy.push(r.template_slug);
          }
        } else {
          unresolvedMap.set(slug, { slug, label, referencedBy: [r.template_slug] });
        }
      }
      return { slug, kind };
    });

    return {
      slug: r.template_slug,
      name: r.template_name,
      category: r.category,
      itemOrder,
      beginnerInstructions: r.beginner_instruction ? [r.beginner_instruction] : [],
      coachNotes: r.coach_notes ? [stripFootnote(r.coach_notes)] : [],
    };
  });

  // 5. progression rules
  const ruleRows = parseTable(extractSection(md, "Progression rules"));
  const progressionRules: ProgressionRule[] = ruleRows.map((r) => ({
    slug: r.rule_slug,
    name: r.rule_name,
    appliesTo: nullableOrList(r.applies_to),
    logic: stripFootnote(r.logic),
    beginnerField: r.beginner_field ? stripBackticks(r.beginner_field) : null,
    coachNote: r.coach_note ? stripFootnote(r.coach_note) : null,
  }));

  // 6. enrichment from sample records (richer detail for the few slugs that have it)
  enrichFromSample(md, "Sample exercise record", (sample) => {
    const ex = exerciseBySlug.get(sample.slug);
    if (!ex) return;
    ex.executionSteps = sample.execution_steps ?? [];
    ex.cues = sample.cues ?? [];
    ex.mistakes = sample.mistakes ?? [];
    ex.regressions = sample.regressions ?? [];
    ex.progressions = sample.progressions ?? [];
    ex.coachNotes = sample.coach_notes ?? [];
    ex.beginnerInstructions = sample.beginner_instructions ?? [];
  });

  enrichFromSample(md, "Sample movement-technique record", (sample) => {
    const tech = techniqueBySlug.get(sample.slug);
    if (!tech) return;
    tech.executionSteps = sample.execution_steps ?? [];
    tech.keyCues = sample.key_cues ?? tech.keyCues;
    tech.commonMistakes = sample.common_mistakes ?? tech.commonMistakes;
    tech.beginnerVersion = sample.beginner_version ?? tech.beginnerVersion;
    tech.progressionVersion = sample.progression_version ?? tech.progressionVersion;
    tech.suggestedFrequency = sample.suggested_frequency ?? null;
    tech.suggestedDose = sample.suggested_dose ?? null;
    tech.coachNotes = sample.coach_notes ?? [];
    if (sample.media_reference) {
      tech.mediaReference = {
        title: sample.media_reference.title ?? tech.mediaReference?.title ?? null,
        url: sample.media_reference.url ?? tech.mediaReference?.url ?? null,
        source: sample.media_reference.source ?? null,
      };
    }
  });

  enrichFromSample(md, "Sample progression rule record", (sample) => {
    const rule = progressionRules.find((r) => r.slug === sample.slug);
    if (!rule) return;
    (rule as unknown as { coachNotes: string[] }).coachNotes = sample.coach_notes ?? [];
    (rule as unknown as { beginnerInstructions: string[] }).beginnerInstructions =
      sample.beginner_instructions ?? [];
  });

  // 7. write outputs
  mkdirSync(OUT_DIR, { recursive: true });
  const write = (file: string, data: unknown) =>
    writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data, null, 2) + "\n");

  write("exercises.json", exercises);
  write("movement-techniques.json", techniques);
  write("weekly-program.json", weeklyProgram);
  write("workout-templates.json", templates);
  write("progression-rules.json", progressionRules);
  write("unresolved-refs.json", Array.from(unresolvedMap.values()));

  console.log(
    `Parsed ${exercises.length} exercises, ${techniques.length} techniques, ` +
      `${templates.length} templates, ${weeklyProgram.length} program days, ` +
      `${progressionRules.length} progression rules, ${unresolvedMap.size} unresolved refs.`
  );
}

function enrichFromSample(
  md: string,
  headingText: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply: (sample: any) => void
) {
  const headingIdx = md.indexOf(`### ${headingText}`);
  if (headingIdx === -1) return;
  const rest = md.slice(headingIdx);
  const fenceStart = rest.indexOf("```json");
  if (fenceStart === -1) return;
  const afterFence = rest.slice(fenceStart + "```json".length);
  const fenceEnd = afterFence.indexOf("```");
  const jsonText = afterFence.slice(0, fenceEnd);
  const sample = JSON.parse(jsonText);
  apply(sample);
}

main();
