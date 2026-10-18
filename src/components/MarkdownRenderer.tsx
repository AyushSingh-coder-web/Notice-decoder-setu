import React from 'react';
import { ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Render inline formatting (bold, italic, code, links)
  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matching:
    // 1. **bold**
    // 2. *italic* or _italic_
    // 3. `inline code`
    // 4. [link text](url)
    const tokenRegex = /(\*\*[\s\S]+?\*\*|\*[^\s*][^*]*?\*|_[^\s_][^_]*?_|`[^`]+?`|\[[^\]]+?\]\([^)]+?\))/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Bold: **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const inner = part.slice(2, -2);
        return (
          <strong
            key={index}
            className="font-bold text-violet-300 dark:text-violet-300 drop-shadow-sm"
          >
            {renderInline(inner)}
          </strong>
        );
      }

      // Inline code: `code`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        const inner = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-black/40 border border-[#252936] text-cyan-300 font-mono text-[11px] mx-0.5 inline-block"
          >
            {inner}
          </code>
        );
      }

      // Link: [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, linkText, url] = linkMatch;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-0.5 transition-colors"
          >
            <span>{linkText}</span>
            <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
          </a>
        );
      }

      // Italic: *text* or _text_
      if (
        ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) &&
        part.length >= 2
      ) {
        const inner = part.slice(1, -1);
        return (
          <em key={index} className="italic text-[#A6ACB8] font-normal">
            {renderInline(inner)}
          </em>
        );
      }

      // Plain text
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  // Parse blocks: code blocks, headings, lists, blockquotes, paragraphs
  const renderBlocks = () => {
    // First, extract triple backtick code blocks
    const lines = content.split('\n');
    const nodes: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code block start
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        nodes.push(
          <div
            key={`code-${nodes.length}`}
            className="my-2.5 rounded-lg bg-[#08090B] border border-[#252936] p-3 overflow-x-auto text-xs"
          >
            {lang && (
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400/90 mb-1.5 pb-1 border-b border-[#252936]">
                {lang}
              </div>
            )}
            <pre className="font-mono text-[11px] text-emerald-300/90 leading-relaxed overflow-x-auto">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Empty line / paragraph break
      if (!line.trim()) {
        i++;
        continue;
      }

      // Headings
      if (line.startsWith('### ')) {
        nodes.push(
          <h3
            key={`h3-${nodes.length}`}
            className="text-xs font-bold text-violet-300 dark:text-violet-300 mt-2.5 mb-1.5 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
            <span>{renderInline(line.slice(4))}</span>
          </h3>
        );
        i++;
        continue;
      }

      if (line.startsWith('## ')) {
        nodes.push(
          <h2
            key={`h2-${nodes.length}`}
            className="text-sm font-bold text-cyan-300 dark:text-cyan-300 mt-3 mb-1.5 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span>{renderInline(line.slice(3))}</span>
          </h2>
        );
        i++;
        continue;
      }

      if (line.startsWith('# ')) {
        nodes.push(
          <h1
            key={`h1-${nodes.length}`}
            className="text-sm sm:text-base font-extrabold text-violet-300 dark:text-violet-300 mt-3 mb-2 flex items-center gap-2 border-b border-[#252936] pb-1"
          >
            <span>{renderInline(line.slice(2))}</span>
          </h1>
        );
        i++;
        continue;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        nodes.push(
          <hr key={`hr-${nodes.length}`} className="my-3 border-[#252936]" />
        );
        i++;
        continue;
      }

      // Blockquote
      if (line.startsWith('> ') || line === '>') {
        const quoteLines: string[] = [line.replace(/^>\s?/, '')];
        i++;
        while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        nodes.push(
          <blockquote
            key={`quote-${nodes.length}`}
            className="my-2 pl-3 py-1.5 border-l-2 border-violet-500 bg-violet-950/20 text-[#A6ACB8] rounded-r text-[11px] leading-relaxed italic"
          >
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx}>{renderInline(ql)}</p>
            ))}
          </blockquote>
        );
        continue;
      }

      // Unordered list (- or * or +)
      if (/^(\s*)[-*+]\s+/.test(line)) {
        const listItems: { indent: number; text: string }[] = [];
        while (i < lines.length && /^(\s*)[-*+]\s+/.test(lines[i])) {
          const match = lines[i].match(/^(\s*)[-*+]\s+(.*)$/);
          if (match) {
            listItems.push({
              indent: match[1].length,
              text: match[2],
            });
          }
          i++;
        }

        nodes.push(
          <ul key={`ul-${nodes.length}`} className="my-2 space-y-1.5 pl-0.5">
            {listItems.map((item, liIdx) => (
              <li
                key={liIdx}
                className="flex items-start gap-2 leading-relaxed"
                style={{ paddingLeft: `${Math.min(item.indent * 8, 24)}px` }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    item.indent > 0 ? 'bg-violet-400' : 'bg-cyan-400'
                  }`}
                />
                <div className="flex-1 min-w-0 text-[#F5F7FA]">
                  {renderInline(item.text)}
                </div>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list (1. 2. etc.)
      if (/^(\s*)\d+\.\s+/.test(line)) {
        const listItems: { num: string; text: string }[] = [];
        while (i < lines.length && /^(\s*)\d+\.\s+/.test(lines[i])) {
          const match = lines[i].match(/^(\s*)(\d+)\.\s+(.*)$/);
          if (match) {
            listItems.push({
              num: match[2],
              text: match[3],
            });
          }
          i++;
        }

        nodes.push(
          <ol key={`ol-${nodes.length}`} className="my-2 space-y-1.5 pl-0.5">
            {listItems.map((item, liIdx) => (
              <li key={liIdx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-5 h-5 rounded bg-[#08090B] border border-[#252936] text-[10px] font-mono font-bold text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  {item.num}
                </span>
                <div className="flex-1 min-w-0 text-[#F5F7FA]">
                  {renderInline(item.text)}
                </div>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Regular paragraph line(s)
      const paraLines: string[] = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].startsWith('```') &&
        !lines[i].startsWith('#') &&
        !/^(\s*)[-*+]\s+/.test(lines[i]) &&
        !/^(\s*)\d+\.\s+/.test(lines[i]) &&
        !lines[i].startsWith('> ') &&
        lines[i].trim() !== '---'
      ) {
        paraLines.push(lines[i]);
        i++;
      }

      nodes.push(
        <p key={`p-${nodes.length}`} className="my-1.5 leading-relaxed text-[#F5F7FA]">
          {paraLines.map((pl, plIdx) => (
            <React.Fragment key={plIdx}>
              {plIdx > 0 && <br />}
              {renderInline(pl)}
            </React.Fragment>
          ))}
        </p>
      );
    }

    return nodes;
  };

  return <div className={`space-y-1 text-xs ${className}`}>{renderBlocks()}</div>;
};
