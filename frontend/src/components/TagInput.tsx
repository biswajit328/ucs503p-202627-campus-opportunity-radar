import { useState, type KeyboardEvent } from "react";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  accent?: "teal" | "amber";
}

const pillStyles = {
  teal: "bg-teal-400/10 text-teal-300 border border-teal-400/25",
  amber: "bg-amber-400/10 text-amber-300 border border-amber-400/25",
};

export function TagInput({
  tags,
  onChange,
  placeholder = "Type and press Enter",
  accent = "teal",
}: Props) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();
    if (!value) return;
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...tags, value]);
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${pillStyles[accent]}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 text-ink outline-none transition-colors focus:border-teal-400"
      />
    </div>
  );
}
