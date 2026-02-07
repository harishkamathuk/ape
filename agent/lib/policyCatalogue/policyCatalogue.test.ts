import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  loadCatalogue,
  loadText,
  validateCatalogueMarkdown,
  validateAgainstSchema,
  validateFreezeMetadata,
  validateMappingCompleteness,
  validateNoDeferredReasoningLanguage,
  validateUniqueIds,
} from "./validators";

const repoRoot = path.resolve(process.cwd(), "..");
const cataloguePath = path.join(
  repoRoot,
  "artifacts",
  "policy",
  "default",
  "decision-principles-catalogue.json"
);
const schemaPath = path.join(
  repoRoot,
  "artifacts",
  "policy",
  "default",
  "decision-principles-catalogue.schema.json"
);
const markdownPath = path.join(
  repoRoot,
  "artifacts",
  "policy",
  "default",
  "decision-principles-catalogue.md"
);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("Decision Principles Catalogue - machine addressability", () => {
  it("policyCatalogue.validatesAgainstSchema", () => {
    const catalogue = loadCatalogue(cataloguePath);
    const schema = loadCatalogue(schemaPath);
    const errors = validateAgainstSchema(catalogue, schema);
    expect(errors).toEqual([]);
  });

  it("policyCatalogue.everyQuestionMapsToIPM", () => {
    const catalogue = loadCatalogue(cataloguePath);
    const errors = validateMappingCompleteness(catalogue);
    expect(errors).toEqual([]);
  });

  it("policyCatalogue.noDeferredReasoningLanguage", () => {
    const catalogue = loadCatalogue(cataloguePath);
    const errors = validateNoDeferredReasoningLanguage(catalogue);
    expect(errors).toEqual([]);
  });

  it("policyCatalogue.freezeMetadataPresent", () => {
    const catalogue = loadCatalogue(cataloguePath);
    const errors = validateFreezeMetadata(catalogue);
    expect(errors).toEqual([]);
  });

  it("policyCatalogue.markdownHasVersionAndChangelog", () => {
    const markdown = loadText(markdownPath);
    const errors = validateCatalogueMarkdown(markdown);
    expect(errors).toEqual([]);
  });

  it("rejects duplicate question_id", () => {
    const catalogue = clone(loadCatalogue(cataloguePath) as any);
    catalogue.principles[1].question_id = catalogue.principles[0].question_id;
    const errors = validateUniqueIds(catalogue);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects missing ipm_field_key", () => {
    const catalogue = clone(loadCatalogue(cataloguePath) as any);
    delete catalogue.principles[0].ipm_mapping.ipm_field_key;
    const errors = validateMappingCompleteness(catalogue);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects deferred reasoning language", () => {
    const catalogue = clone(loadCatalogue(cataloguePath) as any);
    catalogue.principles[0].rationale = "TBD";
    const errors = validateNoDeferredReasoningLanguage(catalogue);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects missing catalogue_version", () => {
    const catalogue = clone(loadCatalogue(cataloguePath) as any);
    delete catalogue.metadata.catalogue_version;
    const errors = validateFreezeMetadata(catalogue);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects empty changelog", () => {
    const catalogue = clone(loadCatalogue(cataloguePath) as any);
    catalogue.metadata.changelog = [];
    const errors = validateFreezeMetadata(catalogue);
    expect(errors.length).toBeGreaterThan(0);
  });
});
