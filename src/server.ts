import {
  createConnection,
  TextDocuments,
  InitializeParams,
  Hover,
  HoverParams,
  TextDocumentSyncKind,
  CompletionParams,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import {
  completionFieldHandlers,
  getDefaultHover,
  hoverFieldHandlers,
  inlayHintFileHandlers,
} from "./modules";

const connection = createConnection();
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      inlayHintProvider: true,
      completionProvider: {
        resolveProvider: false,
      },
    },
  };
});

connection.languages.inlayHint.on((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];

  const fileName = decodeURIComponent(
    params.textDocument.uri.split("/").pop() ?? ""
  );
  const handler = inlayHintFileHandlers[fileName] ?? (() => []);

  return handler(doc, params);
});

connection.onHover((params: HoverParams): Hover | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;

  const line = params.position.line;
  const charPos = params.position.character;

  const lineText = doc.getText({
    start: { line, character: 0 },
    end: { line, character: Number.MAX_VALUE },
  });

  const fields = lineText.split("|");
  if (fields.length === 0) return null;

  let charIndex = 0;
  let fieldIndex = -1;

  for (let i = 0; i < fields.length; i++) {
    const fieldLength = fields[i].length;
    if (charPos >= charIndex && charPos <= charIndex + fieldLength) {
      fieldIndex = i;
      break;
    }
    charIndex += fieldLength + 1;
  }

  if (fieldIndex === -1) return null;

  const handler = hoverFieldHandlers[fieldIndex] || getDefaultHover;
  return handler(fields, fieldIndex, params);
});

connection.onCompletion((params: CompletionParams) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];

  const pos = params.position;
  const lineText = doc.getText({
    start: { line: pos.line, character: 0 },
    end: { line: pos.line, character: Number.MAX_VALUE },
  });

  const fields = lineText.split("|");

  let charIndex = 0;
  let fieldIndex = -1;
  for (let i = 0; i < fields.length; i++) {
    const len = fields[i].length;
    if (pos.character >= charIndex && pos.character <= charIndex + len) {
      fieldIndex = i;
      break;
    }
    charIndex += len + 1;
  }

  if (fieldIndex === -1) return [];

  const handler = completionFieldHandlers[fieldIndex];
  if (!handler) return [];

  return handler(fields, fieldIndex, pos);
});

documents.listen(connection);
connection.listen();
