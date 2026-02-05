"use client";

import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Strikethrough,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  editor: Editor | null;
}

export default function EditorToolbar({ editor }: Props) {
  const [, forceUpdate] = useState(0);
  const [headingOpen, setHeadingOpen] = useState(false);

  // 🔑 Force toolbar re-render on editor updates
  useEffect(() => {
    if (!editor) return;

    const update = () => forceUpdate((v) => v + 1);

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    cn(
      "h-8 w-8 p-0",
      active ? "bg-gray-200 text-gray-900" : "hover:bg-gray-200 text-gray-600",
    );

  const currentBlock = editor.isActive("heading", { level: 1 })
    ? "Heading 1"
    : editor.isActive("heading", { level: 2 })
      ? "Heading 2"
      : editor.isActive("heading", { level: 3 })
        ? "Heading 3"
        : "Normal";

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-xl border-b border-gray-200 bg-gray-50 px-2 py-1">
      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 size={16} />
      </Button>

      <Divider />

      {/* Heading dropdown */}

      <DropdownMenu open={headingOpen} onOpenChange={setHeadingOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-[120px] justify-between px-2 text-sm focus-visible:ring-0"
          >
            <span className="truncate">{currentBlock}</span>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-[140px]">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              editor.chain().focus().setNode("paragraph").run();
              setHeadingOpen(false);
            }}
          >
            Normal
          </DropdownMenuItem>

          {[1, 2, 3].map((level) => (
            <DropdownMenuItem
              key={level}
              onSelect={(e) => {
                e.preventDefault();
                editor.chain().focus().setNode("heading", { level }).run();
                setHeadingOpen(false);
              }}
            >
              Heading {level}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />

      {/* Text styles */}
      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive("underline"))}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive("strike"))}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={16} />
      </Button>

      <Divider />

      {/* Alignment */}
      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive({ textAlign: "left" }))}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive({ textAlign: "center" }))}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive({ textAlign: "right" }))}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive({ textAlign: "justify" }))}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify size={16} />
      </Button>

      <Divider />

      {/* Indent */}
      <Button
        variant="ghost"
        size="icon"
        disabled={!editor.can().sinkListItem("listItem")}
        onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
      >
        <Indent size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        disabled={!editor.can().liftListItem("listItem")}
        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
      >
        <Outdent size={16} />
      </Button>

      <Divider />

      {/* Lists & blocks */}
      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive("blockquote"))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={16} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={btn(editor.isActive("codeBlock"))}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code size={16} />
      </Button>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Divider() {
  return <div className="mx-1 h-5 w-px bg-gray-300" />;
}
