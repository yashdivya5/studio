
// src/lib/mermaid-utils.ts
import mermaid from 'mermaid';

// Call initializeMermaid once when the module is loaded, ensuring it runs on client.
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
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
    container.innerHTML = ''; // Clear if no code
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
    console.error('Problematic Mermaid code passed to render:', code);
    container.innerHTML = `<div class="p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
        <p class="font-semibold">Error rendering diagram:</p>
        <pre class="mt-2 text-sm whitespace-pre-wrap">${(error as Error).message || 'Unknown error'}</pre>
        <p class="mt-2 text-xs">Please check your diagram code for syntax errors. Ensure it does not include Markdown fences like \`\`\`mermaid.\`\`\`</p>
        <p class="mt-2 text-xs font-semibold">Code submitted to Mermaid:</p>
        <pre class="mt-1 text-xs whitespace-pre-wrap bg-muted/50 p-2 rounded-sm overflow-auto max-h-40">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
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
  if (!ctx) {
    alert("Could not create canvas context for PNG export.");
    return;
  }
  
  // Create a DOM parser to handle the SVG string
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
  const svgElement = svgDoc.documentElement as unknown as SVGGraphicsElement;

  // Mermaid often includes a <style> tag. We need to inline these styles for the canvas to render them.
  const styleElement = svgElement.querySelector('style');
  if (styleElement && styleElement.sheet) {
    try {
      const sheet = styleElement.sheet as CSSStyleSheet;
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSStyleRule) {
          const { selectorText, style: styleDeclaration } = rule;
          const elements = svgElement.querySelectorAll(selectorText);
          elements.forEach(el => {
            for (let i = 0; i < styleDeclaration.length; i++) {
              const prop = styleDeclaration[i];
              const value = styleDeclaration.getPropertyValue(prop);
              (el as HTMLElement).style.setProperty(prop, value);
            }
          });
        }
      }
      // Remove the style tag after inlining
      styleElement.remove();
    } catch(e) {
        console.error("Could not parse stylesheet for PNG export:", e);
        // We can still try to render, it might work for simple diagrams
    }
  }
  
  const updatedSvgString = new XMLSerializer().serializeToString(svgElement);

  const img = new Image();
  const svgBlob = new Blob([updatedSvgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const padding = 20;
    const { width, height } = img;

    if (width === 0 || height === 0) {
      console.error("SVG image has zero intrinsic dimensions, cannot export PNG.");
      URL.revokeObjectURL(url);
      alert("Diagram has no content or dimensions, cannot export as PNG.");
      return;
    }

    canvas.width = width + padding * 2;
    canvas.height = height + padding * 2;
    
    // Set canvas background to match the application's background
    try {
        ctx.fillStyle = window.getComputedStyle(document.body).backgroundColor || 'white';
    } catch (e) {
        ctx.fillStyle = 'white'; // Fallback
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the SVG image onto the canvas
    ctx.drawImage(img, padding, padding, width, height);
    URL.revokeObjectURL(url);

    try {
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Error calling toDataURL:", e);
      alert("Failed to export PNG. The diagram may contain external content that cannot be included.");
    }
  };

  img.onerror = (e) => {
    console.error("Error loading SVG into Image object for PNG export:", e);
    URL.revokeObjectURL(url);
    alert("Failed to load diagram for PNG export. The SVG data might be malformed.");
  };

  img.src = url;
};


export const exportJSON = (diagramCode: string, filename: string = 'diagram.json') => {
  const jsonData = JSON.stringify({ diagramCode: stripMarkdownFences(diagramCode) }, null, 2);
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
