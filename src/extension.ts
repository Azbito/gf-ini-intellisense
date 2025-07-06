import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  StreamInfo,
} from "vscode-languageclient/node";
import * as net from "net";

let client: LanguageClient;

function checkSettings() {
  const inlayEnabled = vscode.workspace
    .getConfiguration("editor")
    .get("inlayHints.enabled");
  const maxLength = vscode.workspace
    .getConfiguration("editor")
    .get("inlayHints.maximumLength");

  if (inlayEnabled !== true || maxLength !== 3000) {
    vscode.window.showInformationMessage(
      "For better experience, enable 'editor.inlayHints.enabled' and adjust 'editor.inlayHints.maximumLength' to 3000."
    );
  }
}

function connectToServerWithRetry(
  port: number,
  host: string,
  retries = 5,
  delayMs = 1000
): Promise<StreamInfo> {
  return new Promise((resolve, reject) => {
    const tryConnect = (attempt: number) => {
      const socket = net.connect(port, host);
      socket.on("connect", () => {
        resolve({ reader: socket, writer: socket });
      });
      socket.on("error", (err) => {
        socket.destroy();
        if (attempt < retries) {
          setTimeout(() => tryConnect(attempt + 1), delayMs);
        } else {
          vscode.window.showErrorMessage(
            `Failed to connect to LSP. ${retries} attempts: ${err.message}`
          );
          reject(err);
        }
      });
    };
    tryConnect(1);
  });
}

export function activate(_context: vscode.ExtensionContext) {
  const serverOptions = () => connectToServerWithRetry(6009, "127.0.0.1");
  checkSettings();
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file" }],
    outputChannelName: "LSP TCP Client",
  };

  client = new LanguageClient(
    "tcpLanguageServer",
    "LSP TCP Server",
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) return undefined;
  if (client.state === 3) return client.stop();
  return undefined;
}
