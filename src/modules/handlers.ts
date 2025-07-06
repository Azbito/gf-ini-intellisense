import { Hover, HoverParams } from "vscode-languageserver/node";
import { getItemTypeHover, getTranslationHover } from "./hover";
import {
  completionForEquipType,
  completionForGender,
  completionForItemTarget,
  completionForItemType,
  CompletionHandler,
} from "./on-complete";
import { inlayHintCItem, InlayHintHandler } from "./inlay-hint";

export const hoverFieldHandlers: Record<
  number,
  (fields: string[], fieldIndex: number, params: HoverParams) => Hover | null
> = {
  0: getTranslationHover,
  10: getItemTypeHover,
};

export const completionFieldHandlers: Record<number, CompletionHandler> = {
  10: completionForItemType,
  11: completionForEquipType,
  14: completionForItemTarget,
  15: completionForGender,
};

export const inlayHintFileHandlers: Record<string, InlayHintHandler> = {
  "c_item.ini": inlayHintCItem,
};
