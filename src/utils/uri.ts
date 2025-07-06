import { URI } from "vscode-uri";

export function uriToPath(uri: string): string {
  return URI.parse(uri).fsPath;
}
