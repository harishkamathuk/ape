import Ajv, { type ErrorObject } from "ajv/dist/2020";

export type ValidationError = {
  path: string;
  message: string;
  keyword: string;
  schemaPath?: string;
};

const FORBIDDEN_PHRASES = [
  "tbd",
  "to be decided",
  "we'll reason later",
  "decide later",
  "model will infer",
  "infer later",
];

const CATALOGUE_VERSION_PATTERN = /^(\d+\.\d+\.\d+|\d{4}-\d{2}-\d{2})$/;

export function loadCatalogue(path: string): unknown {
  const fs = require("node:fs") as typeof import("node:fs");
  const raw = fs.readFileSync(path, "utf-8");
  return JSON.parse(raw) as unknown;
}

export function loadText(path: string): string {
  const fs = require("node:fs") as typeof import("node:fs");
  return fs.readFileSync(path, "utf-8");
}

export function validateAgainstSchema(
  catalogueJson: unknown,
  schemaJson: unknown
): ValidationError[] {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schemaJson);
  const ok = validate(catalogueJson);
  if (ok) return [];

  const errors = (validate.errors ?? []) as ErrorObject[];
  return errors.map((err) => ({
    path: toJsonPath(err.instancePath),
    message: err.message ?? "Schema validation error",
    keyword: err.keyword,
    schemaPath: err.schemaPath,
  }));
}

export function validateUniqueIds(catalogueJson: any): ValidationError[] {
  const principles = catalogueJson?.principles ?? [];
  const seen = new Map<string, number[]>();

  principles.forEach((p: any, idx: number) => {
    const id = p?.question_id;
    if (typeof id !== "string") return;
    const list = seen.get(id) ?? [];
    list.push(idx);
    seen.set(id, list);
  });

  const errors: ValidationError[] = [];
  for (const [id, indices] of seen.entries()) {
    if (indices.length > 1) {
      indices.forEach((i) => {
        errors.push({
          path: `$.principles[${i}].question_id`,
          message: `Duplicate question_id "${id}" (must be unique).`,
          keyword: "unique",
        });
      });
    }
  }
  return errors;
}

export function validateMappingCompleteness(catalogueJson: any): ValidationError[] {
  const principles = catalogueJson?.principles ?? [];
  const errors: ValidationError[] = [];

  principles.forEach((p: any, idx: number) => {
    const mapping = p?.ipm_mapping ?? {};
    if (!isNonEmptyString(mapping.ipm_section_heading)) {
      errors.push({
        path: `$.principles[${idx}].ipm_mapping.ipm_section_heading`,
        message: "ipm_section_heading is required and must be non-empty.",
        keyword: "required",
      });
    }
    if (!isNonEmptyString(mapping.ipm_field_key)) {
      errors.push({
        path: `$.principles[${idx}].ipm_mapping.ipm_field_key`,
        message: "ipm_field_key is required and must be non-empty.",
        keyword: "required",
      });
    }
  });

  return errors;
}

export function validateFreezeMetadata(catalogueJson: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const metadata = catalogueJson?.metadata ?? {};

  if (!isNonEmptyString(metadata.catalogue_version)) {
    errors.push({
      path: "$.metadata.catalogue_version",
      message: "catalogue_version is required and must be non-empty.",
      keyword: "required",
    });
  } else if (!CATALOGUE_VERSION_PATTERN.test(metadata.catalogue_version)) {
    errors.push({
      path: "$.metadata.catalogue_version",
      message: "catalogue_version must be semver (X.Y.Z) or date-based (YYYY-MM-DD).",
      keyword: "pattern",
    });
  }

  const changelog = metadata.changelog;
  if (!Array.isArray(changelog) || changelog.length === 0) {
    errors.push({
      path: "$.metadata.changelog",
      message: "changelog is required and must contain at least one entry.",
      keyword: "minItems",
    });
  }

  return errors;
}

export function validateCatalogueMarkdown(markdown: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const hasVersion = /^version:\s*\S+/m.test(markdown);
  const hasChangelog = /^##\s+Changelog\b/m.test(markdown);

  if (!hasVersion) {
    errors.push({
      path: "$.markdown.front_matter.version",
      message: "Catalogue markdown must include a version header.",
      keyword: "required",
    });
  }

  if (!hasChangelog) {
    errors.push({
      path: "$.markdown.sections.changelog",
      message: "Catalogue markdown must include a Changelog section.",
      keyword: "required",
    });
  }

  return errors;
}

export function validateNoDeferredReasoningLanguage(catalogueJson: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  traverseStrings(catalogueJson, "$", (path, value) => {
    const lowered = value.toLowerCase();
    for (const phrase of FORBIDDEN_PHRASES) {
      if (lowered.includes(phrase)) {
        errors.push({
          path,
          message: `Forbidden phrase detected: "${phrase}".`,
          keyword: "forbidden",
        });
      }
    }
  });
  return errors;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toJsonPath(instancePath: string): string {
  if (!instancePath) return "$";
  const parts = instancePath
    .split("/")
    .filter(Boolean)
    .map((p) => (p.match(/^\d+$/) ? `[${p}]` : `.${p}`));
  return `$${parts.join("")}`;
}

function traverseStrings(
  value: unknown,
  path: string,
  onString: (path: string, value: string) => void
): void {
  if (typeof value === "string") {
    onString(path, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, idx) => traverseStrings(item, `${path}[${idx}]`, onString));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      traverseStrings(val, `${path}.${key}`, onString);
    });
  }
}
