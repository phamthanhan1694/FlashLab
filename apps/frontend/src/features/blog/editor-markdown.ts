export type MarkdownTool =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'quote'
  | 'bullet'
  | 'numbered'
  | 'checklist'
  | 'code'
  | 'codeblock'
  | 'rule';
export interface MarkdownEdit {
  text: string;
  start: number;
  end: number;
}
export function formatMarkdown(
  text: string,
  start: number,
  end: number,
  tool: MarkdownTool,
  placeholder = 'Nội dung',
): MarkdownEdit {
  const replace = (
    from: number,
    to: number,
    insertion: string,
    selectFrom = 0,
    selectTo = insertion.length,
  ): MarkdownEdit => ({
    text: text.slice(0, from) + insertion + text.slice(to),
    start: from + selectFrom,
    end: from + selectTo,
  });
  const wrappers: Partial<Record<MarkdownTool, string>> = {
    bold: '**',
    italic: '*',
    strike: '~~',
    code: '`',
  };
  const marker = wrappers[tool];
  if (marker) {
    const selected = text.slice(start, end);
    if (
      start >= marker.length &&
      text.slice(start - marker.length, start) === marker &&
      text.slice(end, end + marker.length) === marker
    )
      return replace(start - marker.length, end + marker.length, selected);
    if (
      selected.startsWith(marker) &&
      selected.endsWith(marker) &&
      selected.length >= marker.length * 2
    )
      return replace(start, end, selected.slice(marker.length, -marker.length));
    const content = selected || placeholder;
    return replace(
      start,
      end,
      marker + content + marker,
      marker.length,
      marker.length + content.length,
    );
  }
  if (tool === 'rule') return replace(start, end, '\n\n---\n\n', 7, 7);
  if (tool === 'codeblock') {
    const content = text.slice(start, end) || placeholder;
    const prefix = '\n\n```\n';
    return replace(
      start,
      end,
      prefix + content + '\n```\n\n',
      prefix.length,
      prefix.length + content.length,
    );
  }
  const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
  const finalPosition = end > start && text[end - 1] === '\n' ? end - 1 : end;
  const nextBreak = text.indexOf('\n', finalPosition);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const lines = text.slice(lineStart, lineEnd).split('\n');
  const prefix =
    tool === 'quote'
      ? '> '
      : tool === 'bullet'
        ? '- '
        : tool === 'checklist'
          ? '- [ ] '
          : tool === 'numbered'
            ? '1. '
            : `${'#'.repeat(Number(tool.slice(1)))} `;
  const allPrefixed =
    tool === 'numbered'
      ? lines.every((line) => /^\d+\. /.test(line))
      : lines.every((line) => line.startsWith(prefix));
  const transformed = lines.map((line, i) =>
    allPrefixed
      ? tool === 'numbered'
        ? line.replace(/^\d+\. /, '')
        : line.slice(prefix.length)
      : (tool === 'numbered' ? `${i + 1}. ` : prefix) +
        line.replace(tool.startsWith('h') ? /^#{1,6} / : /$^/, ''),
  );
  return replace(lineStart, lineEnd, transformed.join('\n'));
}
export function markdownTable(
  rows: number,
  columns: number,
  heading = 'Cột',
  content = 'Nội dung',
): string {
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  return (
    '\n\n' +
    [
      line(Array.from({ length: columns }, (_, i) => `${heading} ${i + 1}`)),
      line(Array(columns).fill('---')),
      ...Array.from({ length: rows }, () => line(Array(columns).fill(content))),
    ].join('\n') +
    '\n\n'
  );
}
