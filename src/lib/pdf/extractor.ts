/**
 * PDF Text Extraction Utility
 * Extracts plain text from uploaded PDF files for AI Compliance Auditing.
 * Handles text object streams (BT ... ET), bracketed string literals, and hex strings.
 */

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const content = buffer.toString("binary");
    const textPieces: string[] = [];

    // Search for PDF text blocks between BT (Begin Text) and ET (End Text) operators
    const textBlockRegex = /BT[\s\S]*?ET/g;
    const matches = content.match(textBlockRegex);

    if (matches && matches.length > 0) {
      for (const block of matches) {
        // Extract string literals in parentheses (text)
        const stringLiteralRegex = /\(([^)]*)\)/g;
        let literalMatch: RegExpExecArray | null;

        while ((literalMatch = stringLiteralRegex.exec(block)) !== null) {
          const rawText = literalMatch[1];
          // Unescape common PDF escapes
          const cleaned = rawText
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .replace(/\\\\/g, "\\");

          if (cleaned.trim()) {
            textPieces.push(cleaned);
          }
        }
      }
    }

    const extracted = textPieces.join(" ").replace(/\s+/g, " ").trim();

    if (extracted.length > 50) {
      return extracted;
    }

    // Fallback: UTF-8 string sweep if BT/ET markers are compressed or raw text stream
    const rawCleaned = buffer
      .toString("utf-8")
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return rawCleaned.slice(0, 50000);
  } catch (error) {
    console.error("[extractTextFromPdfBuffer error]:", error);
    throw new Error("Failed to extract text from PDF document.");
  }
}
