export function preprocessMathContent(content: string): string {
    // Handle display math ($$...$$) and \[...\]
    content = content.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
      // Keep display math as is
      return match;
    });
  
    // Handle inline math ($...$ and \(...\))
    content = content.replace(/(\$[^\$\n]+?\$|\\\([^\)\n]+?\\\))/g, (match) => {
      // Remove newlines in inline math
      return match.replace(/\s+/g, ' ');
    });
  
    return content;
  }