function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(text) {
    const escaped = escapeHtml(text);

    return escaped
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

export function parseFrontMatter(markdown) {
    const normalized = markdown.replace(/\r\n/g, '\n');

    if (!normalized.startsWith('---\n')) {
        return {
            metadata: {},
            body: normalized.trim()
        };
    }

    const endIndex = normalized.indexOf('\n---\n', 4);

    if (endIndex === -1) {
        return {
            metadata: {},
            body: normalized.trim()
        };
    }

    const metadataBlock = normalized.slice(4, endIndex).trim();
    const body = normalized.slice(endIndex + 5).trim();
    const metadata = {};

    metadataBlock
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
            const separatorIndex = line.indexOf(':');

            if (separatorIndex === -1) {
                return;
            }

            const key = line.slice(0, separatorIndex).trim();
            const value = line.slice(separatorIndex + 1).trim();
            metadata[key] = value;
        });

    return { metadata, body };
}

export function stripMarkdown(markdown) {
    return markdown
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        .replace(/[>#*_~-]/g, ' ')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function markdownToHtml(markdown) {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let paragraph = [];
    let listItems = [];

    const flushParagraph = () => {
        if (!paragraph.length) {
            return;
        }

        blocks.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
        paragraph = [];
    };

    const flushList = () => {
        if (!listItems.length) {
            return;
        }

        blocks.push(`<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
        listItems = [];
    };

    lines.forEach((rawLine) => {
        const line = rawLine.trim();

        if (!line) {
            flushParagraph();
            flushList();
            return;
        }

        if (line.startsWith('- ')) {
            flushParagraph();
            listItems.push(line.slice(2).trim());
            return;
        }

        if (line.startsWith('## ')) {
            flushParagraph();
            flushList();
            blocks.push(`<h4>${renderInlineMarkdown(line.slice(3).trim())}</h4>`);
            return;
        }

        if (line.startsWith('# ')) {
            flushParagraph();
            flushList();
            blocks.push(`<h3>${renderInlineMarkdown(line.slice(2).trim())}</h3>`);
            return;
        }

        paragraph.push(line);
    });

    flushParagraph();
    flushList();

    return blocks.join('');
}

export function escapeText(value = '') {
    return escapeHtml(String(value));
}
