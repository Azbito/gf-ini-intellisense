import {
  CompletionItem,
  CompletionItemKind,
  Range,
  TextEdit,
} from "vscode-languageserver";
import {
  EEquipType,
  EGender,
  EItemTarget,
  EItemTypeCompletions,
} from "../data";

export type CompletionHandler = (
  fields: string[],
  fieldIndex: number,
  pos: { line: number; character: number }
) => CompletionItem[];

function getFieldCharIndex(fields: string[], targetIndex: number): number {
  return fields.slice(0, targetIndex).reduce((acc, f) => acc + f.length + 1, 0);
}
const createEnumCompletionHandler = (
  enumValues: { label: string; detail: string }[],
  enumName: string
): CompletionHandler => {
  return (fields, fieldIndex, pos) => {
    const charIndex = getFieldCharIndex(fields, fieldIndex);
    const fieldLength = fields[fieldIndex].length;

    return enumValues.map((item) => ({
      label: item.label,
      kind: CompletionItemKind.EnumMember,
      detail: `Value = ${item.detail}`,
      documentation: `${enumName} enum value ${item.label}`,
      insertText: item.detail,
      textEdit: TextEdit.replace(
        Range.create(pos.line, charIndex, pos.line, charIndex + fieldLength),
        item.detail
      ),
    }));
  };
};

export const completionForItemType = createEnumCompletionHandler(
  EItemTypeCompletions,
  "EItemType"
);
export const completionForEquipType = createEnumCompletionHandler(
  EEquipType,
  "EquipType"
);
export const completionForGender = createEnumCompletionHandler(
  EGender,
  "Gender"
);
export const completionForItemTarget = createEnumCompletionHandler(
  EItemTarget,
  "ItemTarget"
);
