// src/lib/mermaid-utils.ts
import mermaid from 'mermaid';

const initializeMermaid = () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral', // Using 'neutral' or 'default'. 'forest' is also nice with dark themes.
    // For custom theming with CSS variables:
    // theme: 'base',
    // themeVariables: {
    //   background: getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
    //   primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
    //   primaryTextColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-foreground').trim(),
    //   lineColor: getComputedStyle(document.documentElement).getPropertyValue('--border').trim(),
    //   textColor: getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim(),
    // }
    securityLevel: 'loose', // Or 'strict' or 'antiscript' depending on needs
    // Other configurations if needed
  });
};

// Call initializeMermaid once when the module is loaded, ensuring it runs on client.
if (typeof window !== 'undefined') {
  initializeMermaid();
}

export const renderMermaidDiagram = async (elementId: string, code: string): Promise<string | undefined> => {
  if (!code.trim()) {
    const container = document.getElementById(elementId);
    if (container) container.innerHTML = '<p class="text-muted-foreground p-4">Enter a prompt to generate a diagram, or paste Mermaid code.</p>';
    return;
  }
  try {
    // mermaid.mermaidAPI.reset(); // Might be needed if re-rendering causes issues
    const { svg } = await mermaid.render(elementId + '-svg', code);
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = svg;
    }
    return svg;
  } catch (error) {
    console.error('Mermaid rendering error:', error);
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = `<div class="p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
        <p class="font-semibold">Error rendering diagram:</p>
        <pre class="mt-2 text-sm whitespace-pre-wrap">${(error as Error).message || 'Unknown error'}</pre>
        <p class="mt-2 text-xs">Please check your diagram code for syntax errors.</p>
      </div>`;
    }
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
  document.body.removeChild(link);
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
    // Add some padding for better aesthetics
    const padding = 20;
    canvas.width = img.width + padding * 2;
    canvas.height = img.height + padding * 2;

    // Fill background (optional, for transparency handling)
    ctx.fillStyle = 'hsl(var(--background))'; // Use CSS variable for background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(img, padding, padding);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  img.onerror = (e) => {
    console.error("Error loading SVG for PNG export:", e);
    URL.revokeObjectURL(url);
  }
  img.src = url;
};

export const exportJSON = (diagramCode: string, filename: string = 'diagram.json') => {
  const jsonData = JSON.stringify({ diagramCode }, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
