// src/lib/mermaid-utils.ts
import mermaid from 'mermaid';

// Call initializeMermaid once when the module is loaded, ensuring it runs on client.
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral', // Using 'neutral' or 'default'. 'forest' is also nice with dark themes.
    securityLevel: 'loose', // Or 'strict' or 'antiscript' depending on needs
  });
}

const stripMarkdownFences = (code: string): string => {
  const fenceRegex = /^\s*```(?:mermaid|graphviz)?\s*\n?([\s\S]*?)\n?\s*```\s*$/;
  const match = code.match(fenceRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return code.trim();
};

export const renderMermaidDiagram = async (elementId: string, rawCode: string): Promise<string | undefined> => {
  const container = document.getElementById(elementId);

  if (!container) {
    if (rawCode.trim()) {
      console.warn(`Mermaid container with id '${elementId}' not found in DOM. Cannot render diagram.`);
    }
    return undefined;
  }

  const code = stripMarkdownFences(rawCode);

  if (!code) {
    container.innerHTML = '';
    return undefined; 
  }

  try {
    const internalSvgId = `mermaid-svg-${elementId}-${Date.now()}`;
    const { svg, bindFunctions } = await mermaid.render(internalSvgId, code);

    container.innerHTML = svg;

    if (bindFunctions) {
      bindFunctions(container);
    }
    return svg;
  } catch (error) {
    console.error('Mermaid rendering error:', error);
    container.innerHTML = `<div class="p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
        <p class="font-semibold">Error rendering diagram:</p>
        <pre class="mt-2 text-sm whitespace-pre-wrap">${(error as Error).message || 'Unknown error'}</pre>
        <p class="mt-2 text-xs">Please check your diagram code for syntax errors. Ensure it does not include Markdown fences like \`\`\`mermaid.\`\`\`</p>
      </div>`;
    return undefined;
  }
};

export const exportSVG = (svgContent: string, filename: string = 'diagram.svg') => {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  if (document.body.contains(link)) { 
    document.body.removeChild(link);
  }
  URL.revokeObjectURL(url);
};

export const exportPNG = (svgContent: string, filename: string = 'diagram.png') => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const padding = 20;
    canvas.width = img.width + padding * 2;
    canvas.height = img.height + padding * 2;

    ctx.fillStyle = 'hsl(var(--background))'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(img, padding, padding);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    if (document.body.contains(link)) { 
        document.body.removeChild(link);
    }
  };
  img.onerror = (e) => {
    console.error("Error loading SVG for PNG export:", e);
    URL.revokeObjectURL(url);
  }
  img.src = url;
};

export const exportJSON = (diagramCode: string, filename: string = 'diagram.json') => {
  const jsonData = JSON.stringify({ diagramCode: stripMarkdownFences(diagramCode) }, null, 2); // Also strip for JSON export
  const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  if (document.body.contains(link)) { 
    document.body.removeChild(link);
  }
  URL.revokeObjectURL(url);
};
