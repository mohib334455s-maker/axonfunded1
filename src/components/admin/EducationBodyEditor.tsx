"use client";

import dynamic from "next/dynamic";

// TinyMCE `Editor` propTypes typings conflict with `next/dynamic`'s Loader typing.
// @ts-expect-error upstream tinymce-react / next dynamic propTypes mismatch
const Editor = dynamic(() => import("@tinymce/tinymce-react").then((m) => m.Editor), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-lg bg-white/[0.04]" />,
});

type Props = { value: string; onChange: (html: string) => void };

export default function EducationBodyEditor({ value, onChange }: Props) {
  return (
    <Editor
      tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
      licenseKey="gpl"
      value={value}
      onEditorChange={(c) => onChange(c)}
      init={{
        height: 420,
        menubar: false,
        branding: false,
        plugins: "link lists code autoresize",
        toolbar: "undo redo | blocks | bold italic | bullist numlist | link | code",
        content_style: "body { font-family: system-ui, sans-serif; font-size:14px; color:#111 }",
      }}
    />
  );
}
