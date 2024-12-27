// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, (char) => ({ '<': '&lt;', '>': '&gt;' }[char] || char))
      .replace(/&(?!(lt|gt|amp|quot|#39);)/g, '&amp;');
  }
  
  // Only allow TeX expressions and plain text
  export function isValidInput(input: string): boolean {
    // Allow plain text and TeX expressions ($...$ or $$...$$)
    const texPattern = /^[^$]*(\$[^$\n]+\$|\$\$[\s\S]*?\$\$)*[^$]*$/;
    return texPattern.test(input);
  }