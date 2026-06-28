function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineFormat(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inList = false;
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (inList && listType) {
      html.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.+)/);
    const olMatch = line.match(/^\d+\.\s+(.+)/);

    if (ulMatch) {
      if (!inList || listType !== "ul") {
        closeList();
        html.push("<ul>");
        inList = true;
        listType = "ul";
      }
      html.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    if (olMatch) {
      if (!inList || listType !== "ol") {
        closeList();
        html.push("<ol>");
        inList = true;
        listType = "ol";
      }
      html.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    closeList();

    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      html.push(
        `<tr>${cells.map((c) => `<td>${inlineFormat(c)}</td>`).join("")}</tr>`
      );
      continue;
    }

    if (line === "") {
      continue;
    }

    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}
