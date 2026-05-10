import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TagInputProps {
  /** Array of tags */
  tags: string[];
  /** Callback to set new tags array */
  setTags: (tags: string[]) => void;
  /** Optional placeholder for the input */
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, setTags, placeholder }) => {
  const [input, setInput] = useState("");
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addTag = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return; // avoid duplicates
    setTags([...tags, trimmed]);
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input) {
      e.preventDefault();
      addTag(input);
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length) {
      // delete last tag on backspace when input empty
      removeTag(tags.length - 1);
    }
  };

  // Drag & Drop handlers (HTML5 native)
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) return;
    const reordered = [...tags];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setTags(reordered);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 cursor-move"
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDrop}
          >
            <span className="text-sm">{tag}</span>
            <X
              className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100"
              onClick={() => removeTag(idx)}
            />
          </div>
        ))}
        <Input
          className="flex-1 min-w-[120px]"
          placeholder={placeholder ?? "Nuevo tag"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {tags.length > 10 && (
        <p className="text-xs text-yellow-600">You have more than 10 tags – consider reducing for clarity.</p>
      )}
    </div>
  );
};
