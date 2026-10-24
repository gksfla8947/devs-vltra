import { BlockNoteSchema, createCodeBlockSpec } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import { Callout } from "./CalloutBlock";
import { MermaidBlock } from "./MermaidBlock";
import { enhanceCodeBlock } from "./code-block";

// 에디터와 포스트 뷰에서 공통으로 사용하는 스키마.
// 이 스키마를 공유해야 작성 시의 모양과 실제 글 모양이 동일하게 유지된다.
const extendedCodeBlockOptions = {
  ...codeBlockOptions,
  createHighlighter: async () => {
    const highlighter = await codeBlockOptions.createHighlighter();
    const tokenize = highlighter.codeToTokens.bind(highlighter);
    highlighter.codeToTokens = (code, options) => tokenize(code, {
      ...options,
      theme: undefined,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
    return highlighter;
  },
  supportedLanguages: {
    ...codeBlockOptions.supportedLanguages,
    dockerfile: {
      name: "Dockerfile",
      aliases: ["dockerfile", "docker"],
    },
  },
};

export const blocknoteSchema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: enhanceCodeBlock(createCodeBlockSpec(extendedCodeBlockOptions)),
    callout: Callout(),
    mermaid: MermaidBlock(),
  },
});

export type BlocknoteSchema = typeof blocknoteSchema;
