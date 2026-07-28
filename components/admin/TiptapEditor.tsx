"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import type { Editor } from "@tiptap/core";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";

function getMarkdown(editor: Editor): string {
  return (editor.storage as unknown as { markdown: MarkdownStorage }).markdown.getMarkdown();
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm ${active ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({
  initialContent,
  onChangeMarkdown,
}: {
  initialContent: string;
  onChangeMarkdown: (markdown: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      // Canonical storage format is Markdown (see lib/blog/render-markdown.ts)
      // — simpler to diff/back up, renders identically for SSG without a
      // client rich-text runtime, and decouples storage from whatever this
      // editor's internal doc schema is. `html: false` means raw HTML typed
      // into the editor is treated as literal text, not parsed as markup.
      Markdown.configure({ html: false, transformPastedText: true }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChangeMarkdown(getMarkdown(e)),
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[300px] rounded border border-neutral-300 p-3 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 rounded border border-neutral-200 bg-neutral-50 p-1">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          Bold
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          Italic
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          Quote
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
        >
          Link
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
