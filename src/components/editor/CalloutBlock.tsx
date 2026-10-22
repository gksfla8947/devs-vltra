"use client";

import { defaultProps } from "@blocknote/core";
import type { BlockNoteEditor } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";

const calloutTypes = [
  { title: "Info", value: "info", icon: "💡", bg: "#e8f4fd", border: "#b8daf0" },
  { title: "Warning", value: "warning", icon: "⚠️", bg: "#fff8e6", border: "#f0dca0" },
  { title: "Error", value: "error", icon: "🚫", bg: "#fde8e8", border: "#f0b8b8" },
  { title: "Success", value: "success", icon: "✅", bg: "#e8fde8", border: "#b8f0b8" },
  { title: "Note", value: "note", icon: "📝", bg: "#f0f0f0", border: "#d0d0d0" },
] as const;

export const Callout = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      type: {
        default: "info",
        values: ["info", "warning", "error", "success", "note"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const ct = calloutTypes.find((c) => c.value === props.block.props.type)!;
      const addChild = () => {
        // Custom block render props only infer their own block type; the shared
        // editor schema also includes paragraphs, headings and other children.
        const editor = props.editor as unknown as BlockNoteEditor;
        const current = editor.getBlock(props.block.id)!;
        const id = crypto.randomUUID();
        editor.updateBlock(current, {
          children: [...current.children, { id, type: "paragraph", content: [] }],
        });
        props.editor.setTextCursorPosition(id, "start");
        props.editor.focus();
      };
      return (
        <div
          className="callout-title"
          ref={(element) => {
            if (!element) return;
            // Native capture runs before ProseMirror's keyboard handler.
            const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
            const selection = window.getSelection();
            const content = element.querySelector(".callout-text");
            if (!selection?.isCollapsed || !selection.rangeCount || !content?.contains(selection.anchorNode)) return;
            const tail = selection.getRangeAt(0).cloneRange();
            tail.selectNodeContents(content);
            tail.setStart(selection.anchorNode!, selection.anchorOffset);
            // Preserve native splitting when Enter is pressed in the middle of text.
            if (tail.toString()) return;
            event.preventDefault();
            event.stopPropagation();
            const first = props.editor.getBlock(props.block.id)?.children[0];
            if (first) props.editor.setTextCursorPosition(first.id, "start");
            else addChild();
            };
            const root = element.closest(".bn-editor");
            root?.addEventListener("keydown", onKeyDown as EventListener, true);
            return () => root?.removeEventListener("keydown", onKeyDown as EventListener, true);
          }}
        >
          {props.editor.isEditable ? <Menu withinPortal={false}>
            <Menu.Target>
              <div
                contentEditable={false}
                style={{ cursor: "pointer", fontSize: "1.25rem", userSelect: "none", flexShrink: 0 }}
              >
                {ct.icon}
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Callout Type</Menu.Label>
              <Menu.Divider />
              {calloutTypes.map((type) => (
                <Menu.Item
                  key={type.value}
                  leftSection={<span>{type.icon}</span>}
                  onClick={() =>
                    props.editor.updateBlock(props.block, {
                      type: "callout",
                      props: { type: type.value },
                    })
                  }
                >
                  {type.title}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu> : <span aria-hidden="true">{ct.icon}</span>}
          <div className="callout-text" ref={props.contentRef} />
          {props.editor.isEditable && (
            <button type="button" contentEditable={false} className="callout-add"
              aria-label="Callout 내부 블록 추가" title="내부 블록 추가 · /로 제목, 목록, 이미지 선택"
              onClick={addChild}>+</button>
          )}
        </div>
      );
    },
  }
);
