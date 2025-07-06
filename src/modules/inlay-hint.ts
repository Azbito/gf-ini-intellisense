import {
  InlayHint,
  InlayHintKind,
  InlayHintParams,
} from "vscode-languageserver/node";
import { CItemDataFields } from "../data";
import { TextDocument } from "vscode-languageserver-textdocument";

export type InlayHintHandler = (
  doc: TextDocument,
  params: InlayHintParams
) => InlayHint[];

export const inlayHintCItem: InlayHintHandler = (doc, params) => {
  const hints: InlayHint[] = [];

  for (
    let line = params.range.start.line;
    line <= params.range.end.line;
    line++
  ) {
    const isFirstLine = line === 0;

    const lineText = doc.getText({
      start: { line, character: 0 },
      end: { line, character: Number.MAX_VALUE },
    });

    if (!lineText.includes("|")) continue;

    const rawFields = lineText.split("|");
    const fields = rawFields[0] === "" ? rawFields.slice(1) : rawFields;

    let searchFrom = 0;

    for (let i = 0; i < fields.length; i++) {
      const fieldRaw = fields[i];
      const fieldTrimmed = fieldRaw.trim();

      if (fieldTrimmed.length === 0) {
        continue;
      }

      let fieldName: string;
      if (isFirstLine) {
        if (i === 0) fieldName = "Version";
        else if (i === 1) fieldName = "Pipe lines amount";
        else fieldName = CItemDataFields[i] || `Field${i}`;
      } else {
        fieldName = CItemDataFields[i] || `Field${i}`;
      }

      const charIndex = lineText.indexOf(fieldRaw, searchFrom);
      if (charIndex === -1) {
        continue;
      }

      hints.push({
        position: { line, character: charIndex },
        label: fieldName + ":",
        kind: InlayHintKind.Type,
        paddingLeft: true,
        paddingRight: true,
      });

      searchFrom = charIndex + fieldRaw.length;
    }
  }

  return hints;
};
