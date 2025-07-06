import { Hover, HoverParams, MarkupKind } from "vscode-languageserver/node";

import { uriToPath } from "../utils";
import * as path from "path";
import * as fs from "fs";
import { CItemDataFields, EItemTypeCompletions } from "../data";

export function getTranslationHover(
  fields: string[],
  _fieldIndex: number,
  params: HoverParams
): Hover | null {
  const id = fields[0];
  if (!id) return null;

  const currentFilePath = uriToPath(params.textDocument.uri);
  const currentDir = path.dirname(currentFilePath);
  const currentFileName = path.basename(currentFilePath);
  const translateFileName = currentFileName.replace(/^c_/, "t_");
  const translateFilePath = path.join(
    currentDir,
    "..",
    "translate",
    translateFileName
  );
  if (!fs.existsSync(translateFilePath)) return null;

  const translateContent = fs.readFileSync(translateFilePath, "utf-8");
  const regex = new RegExp(`^${id}\\|(.*)$`, "m");
  const match = translateContent.match(regex);
  if (!match) return null;

  const translatedText = match[1].trim();
  const translationParts = translatedText.split("|");
  const [name, description] = translationParts;

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**${name}**\n\n${description}`,
    },
  };
}

export function getItemTypeHover(
  fields: string[],
  fieldIndex: number,
  _params: HoverParams
): Hover {
  const value = fields[fieldIndex].trim();
  const found = EItemTypeCompletions.find((item) => item.detail === value);
  if (!found) {
    return {
      contents: {
        kind: MarkupKind.PlainText,
        value: `ItemType Value: ${value} (Unknown)`,
      },
    };
  }
  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**ItemType**: ${found.label} (${found.detail})`,
    },
  };
}

export function getDefaultHover(
  fields: string[],
  fieldIndex: number,
  _params: HoverParams
): Hover {
  const fieldName = CItemDataFields[fieldIndex] || `Field${fieldIndex}`;
  return {
    contents: {
      kind: MarkupKind.PlainText,
      value: `Field: ${fieldName}`,
    },
  };
}
