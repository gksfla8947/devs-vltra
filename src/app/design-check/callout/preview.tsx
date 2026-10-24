"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { PostEditorRef } from "@/components/editor/PostEditor";

const Editor = dynamic(() => import("@/components/editor/PostEditor"), { ssr: false });
const Reader = dynamic(() => import("@/components/editor/PostRenderer"), { ssr: false });
const sample = [{ type: "codeBlock", props: { language: "javascript" }, content: "const path = \"C:\\\\temp\";\nconst message = \"hello\";\nconsole.log(message);" }, {
  type: "callout", props: { type: "info" }, content: "콜아웃 예시",
  children: [
    { type: "heading", props: { level: 1 }, content: "제목1" },
    { type: "bulletListItem", content: "첫 번째 항목" },
    { type: "bulletListItem", content: "두 번째 항목" },
    { type: "mermaid", props: { source: "graph TD\n  A[Callout] --> B[내부 다이어그램]" } },
  ],
}, { type: "paragraph", content: "콜아웃 바깥의 일반 문단입니다." },
{ type: "mermaid", props: { source: "sequenceDiagram\n  사용자->>블로그: 글 요청\n  블로그-->>사용자: 다이어그램 표시" } }];

export default function CalloutPreview() {
  const ref = useRef<PostEditorRef>(null);
  const [snapshot, setSnapshot] = useState<unknown[]>(sample);
  const [revision, setRevision] = useState(0);
  return <main className="max-w-3xl mx-auto px-6 py-12">
    <h1 className="text-2xl font-bold mb-4">Callout · Mermaid 로컬 테스트</h1>
    <p className="mb-6 text-sm">제목 줄 끝에서 Enter 또는 + 버튼으로 내부 문단을 추가하세요. 내부에서 /를 입력하면 제목·목록·이미지를 선택할 수 있습니다. 빈 문단에서 Enter를 누르면 밖으로 나옵니다. 이 화면의 글은 DB에 저장되지 않습니다.</p>
    <Editor ref={ref} initialContent={sample} />
    <button className="my-6 px-4 py-2 border rounded" onClick={() => {
      setSnapshot(JSON.parse(JSON.stringify(ref.current?.getBlocks() ?? sample)));
      setRevision(value => value + 1);
    }}>현재 내용으로 조회 화면 확인</button>
    <Reader key={revision} blocks={snapshot} />
  </main>;
}
