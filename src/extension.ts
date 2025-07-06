import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import * as path from "path";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  const serverModule = context.asAbsolutePath(path.join("out", "server.js"));

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: 1 },
    debug: { module: serverModule, transport: 1 },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file" }],
    outputChannelName: "LSP GF74",
  };

  client = new LanguageClient(
    "gf74LanguageServer",
    "GF74 Language Server",
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
