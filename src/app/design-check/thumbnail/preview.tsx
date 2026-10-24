"use client";

import { useState } from "react";
import PublishModal from "@/components/editor/PublishModal";

export default function Preview() {
  const [cover, setCover] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [description, setDescription] = useState("본문 이미지 또는 업로드한 이미지로 썸네일을 설정합니다.");
  const [published, setPublished] = useState(true);
  return <main className="p-10">
    <p>썸네일 미리보기 · 게시글은 저장되지 않습니다. 업로드는 관리자 로그인이 필요합니다.</p>
    <button onClick={() => setOpen(true)}>팝업 열기</button>
    {open && <PublishModal title="썸네일 선택 미리보기" slug="thumbnail-preview" description={description} published={published}
      coverImage={cover} images={["/portfolio/poco.png", "/organizations/kookmin.png", "/organizations/autocrypt.png"]}
      onCoverImageChange={setCover} onSlugChange={() => {}} onDescriptionChange={setDescription} onPublishedChange={setPublished}
      onConfirm={() => setOpen(false)} onCancel={() => setOpen(false)} saving={false} />}
  </main>;
}
