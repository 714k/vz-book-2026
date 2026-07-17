// Shared, styling-agnostic content types for the book-content template.
// These describe *data* only — no layout, no presentation.

/** Heading level for a component that lives inside a section. */
export type HeadingLevel = 2 | 3;

/** Editorial hero copy rendered as the article <header>. */
export interface HeroContent {
  /** Section number shown above the title, e.g. "04.2". */
  number?: string;
  /** Main page title. Rendered as the single <h1> of the article. */
  title: string;
  /** Short editorial subtitle / kicker. */
  subtitle?: string;
  /** Punchy lead line. */
  lead?: string;
  /** Longer introductory paragraph. */
  intro?: string;
}

/** Key/value metadata rendered as a <dl>. */
export interface MetadataItems {
  role?: string;
  focus?: string;
  experience?: string;
  scope?: string;
  impact?: string;
  /**
   * Custom term/value pairs. When present, these are rendered in order instead
   * of the fixed fields above — for pages whose metadata does not fit the common
   * Role/Focus/Experience/Scope/Impact labels.
   */
  items?: { term: string; value: string }[];
}

/**
 * Accessible names for the container's grouping parts. A <section> is only
 * exposed as a landmark once it has an accessible name, and these parts group
 * several headed sections without carrying a heading of their own, so the name
 * has to come from here. Defaults cover the common case; override when a page
 * needs a specific name.
 */
export interface PartLabels {
  core?: string;
  impact?: string;
}

/** A single focus area (label, optional blurb, optional icon hook). */
export interface FocusArea {
  title: string;
  description?: string;
  /** Optional name of an icon. Exposed as a data attribute for future use. */
  iconName?: string;
}

/** A decision entry. A plain string is treated as the decision text. */
export type DecisionItem = string | { title: string; description?: string };

/** An impact entry. A plain string is treated as the impact statement. */
export type ImpactMetric = string | { value?: string; label: string };

/** A related-work card. Becomes a link when `href` is provided. */
export interface RelatedWorkItem {
  title: string;
  description?: string;
  href?: string;
  /** Optional short qualifier, e.g. "Product", "Design System". */
  type?: string;
}

/** A titled list of plain entries, e.g. one side of an ownership boundary. */
export interface LabelledGroup {
  title: string;
  items: string[];
}

/** A subheading paired with a paragraph. */
export interface Topic {
  title: string;
  description: string;
}

/** A simple data table: a header row of column names and rows of cells. */
export interface TableBody {
  columns: string[];
  rows: string[][];
}

/** One step of a diagram that reads as an ordered pipeline. */
export interface DiagramStage {
  name: string;
  /** Optional gloss. Omit for a pipeline whose stage names speak for themselves. */
  note?: string;
}

/** A node of a composition tree. Nests to arbitrary depth. */
export interface CompositionNode {
  name: string;
  children?: CompositionNode[];
}

/**
 * A diagram's body. The surrounding copy is always the same, so only the body
 * is discriminated: an ordered pipeline, a literal code block, or a tree.
 */
export type DiagramBody =
  | { kind: 'stages'; stages: DiagramStage[] }
  | { kind: 'code'; code: string }
  | { kind: 'tree'; tree: CompositionNode[] };

/** A full diagram: the figure's copy plus one of the bodies above. */
export type DiagramContent = {
  title: string;
  description?: string;
  caption: string;
  /** Longer text alternative, exposed in a native <details>. */
  summary?: string;
  /** Trailing note rendered under the body, inside the figure. */
  footnote?: string;
} & DiagramBody;

/**
 * A section's body — the one part that genuinely differs between sections.
 * `kind` picks which component renders it, so it is the single place where the
 * content files reach into presentation.
 */
export type SectionBody =
  | { kind: 'focusAreas'; items: FocusArea[] }
  | { kind: 'decisions'; items: DecisionItem[] }
  | { kind: 'metrics'; items: ImpactMetric[] }
  | { kind: 'relatedWork'; items: RelatedWorkItem[] }
  | { kind: 'list'; items: string[] }
  | { kind: 'groups'; groups: LabelledGroup[] }
  | { kind: 'topics'; items: Topic[] }
  | ({ kind: 'table' } & TableBody);

/**
 * One headed section of a page, as data. Every field is optional except the
 * heading, and ContentSection renders whichever are present in a fixed order:
 * statement, paragraphs, body, closing paragraphs, diagram, closing statement.
 */
export interface SectionContent {
  id: string;
  title: string;
  /** Opening line, emphasized. */
  statement?: string;
  paragraphs?: string[];
  body?: SectionBody;
  /** Prose that follows the body. */
  closingParagraphs?: string[];
  diagram?: DiagramContent;
  /** Final line, emphasized. */
  closingStatement?: string;
}

/**
 * A source cited in the page copy. The copy carries the marker (e.g. "[2]") as
 * plain text, and the footer lists the sources in order.
 */
export interface FooterReference {
  /** The marker used in the copy, without brackets, e.g. "2". */
  marker: string;
  title: string;
  href: string;
}

/** Page-level metadata rendered in the article <footer>. */
export interface FooterMeta {
  sectionTitle: string;
  pageTitle: string;
  fileId?: string;
  version?: string;
  lastUpdated?: string;
  author?: string;
  role?: string;
  /** Sources cited in the copy. Omitted by pages that cite nothing. */
  references?: FooterReference[];
}
