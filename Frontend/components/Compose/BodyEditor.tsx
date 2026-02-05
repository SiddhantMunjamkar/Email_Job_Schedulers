"use client";
import { EditorContent, Editor } from "@tiptap/react";
import EditorToolbar from "./EditorToolbar";

interface BodyEditorProps {
  editor: Editor | null;
}

export default function BodyEditor({ editor }: BodyEditorProps) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
