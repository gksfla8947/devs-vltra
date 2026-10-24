import { createCodeBlockSpec } from "@blocknote/core";
import { TextSelection } from "@tiptap/pm/state";

/** Keep the built-in schema, highlighting and HTML serialization compatible. */
export function enhanceCodeBlock(spec: ReturnType<typeof createCodeBlockSpec>) {
  const render = spec.implementation.render;
  spec.implementation.render = function (block, editor) {
    const view = render.call(this, block, editor);
    const code = view.contentDOM!;
    code.setAttribute("spellcheck", "false");
    code.setAttribute("autocorrect", "off");
    code.setAttribute("autocapitalize", "off");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-button";
    button.contentEditable = "false";
    const setCopyState = (state: "copy" | "success" | "error") => {
      const label = state === "success" ? "복사됨" : state === "error" ? "복사 실패" : "코드 복사";
      button.title = label;
      button.setAttribute("aria-label", label);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.8");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", state === "success" ? "M5 12l4 4L19 6" : state === "error" ? "M6 6l12 12M18 6L6 18" : "M9 9h11v11H9zM15 5V3H3v12h2");
      svg.appendChild(path);
      button.replaceChildren(svg);
    };
    setCopyState("copy");
    button.setAttribute("aria-live", "polite");
    view.dom.appendChild(button);
    let timer: ReturnType<typeof setTimeout> | undefined;
    button.onclick = async () => {
      try {
        await navigator.clipboard.writeText(code.textContent ?? "");
        setCopyState("success");
      } catch {
        setCopyState("error");
      }
      clearTimeout(timer);
      timer = setTimeout(() => { setCopyState("copy"); }, 2000);
    };

    const selectionInside = () => {
      const selection = window.getSelection();
      return selection && code.contains(selection.anchorNode) && code.contains(selection.focusNode)
        ? selection : null;
    };
    const copy = (event: ClipboardEvent) => {
      const selection = selectionInside();
      if (!selection || selection.isCollapsed || !event.clipboardData) return;
      // Avoid the editor's Markdown clipboard serializer escaping line breaks.
      const text = selection.getRangeAt(0).cloneContents().textContent ?? "";
      const pre = document.createElement("pre");
      const element = document.createElement("code");
      element.dataset.language = block.props.language;
      element.textContent = text;
      pre.appendChild(element);
      event.clipboardData.setData("text/plain", text);
      event.clipboardData.setData("text/html", pre.outerHTML);
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || !editor.isEditable || !selectionInside()) return;
      editor.transact((tr) => {
        const { $from, $to, anchor, head, empty } = tr.selection;
        if ($from.parent.type.name !== "codeBlock" || !$from.sameParent($to)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (empty && !event.shiftKey) {
          tr.insertText("  ");
          return;
        }
        const text = $from.parent.textContent;
        const start = $from.start();
        const first = $from.parentOffset === 0 ? 0 : text.lastIndexOf("\n", $from.parentOffset - 1) + 1;
        const end = $to.parentOffset;
        const lines = [first];
        for (let pos = text.indexOf("\n", first) + 1; pos > 0 && pos < end; pos = text.indexOf("\n", pos) + 1) lines.push(pos);
        for (const pos of lines.reverse()) {
          if (event.shiftKey) {
            const count = text[pos] === "\t" ? 1 : (text.slice(pos).match(/^ {1,2}/)?.[0].length ?? 0);
            if (count) tr.delete(start + pos, start + pos + count);
          } else tr.insertText("  ", start + pos);
        }
        tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(anchor), tr.mapping.map(head)));
      });
    };
    document.addEventListener("copy", copy, true);
    document.addEventListener("keydown", keydown, true);
    const destroy = view.destroy;
    view.destroy = () => {
      clearTimeout(timer);
      document.removeEventListener("copy", copy, true);
      document.removeEventListener("keydown", keydown, true);
      destroy?.();
    };
    return view;
  };
  return spec;
}
