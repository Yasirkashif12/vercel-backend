export const buildSummaryPrompt = (content: string): string => {
  return `Please summarize the following text:\n\n${content}`;
};

export const buildExtractionPrompt = (content: string): string => {
  return `
Analyze the following text and extract actionable insights.

Text: ${content}

Provide response in this format:

ACTION_ITEMS:
- item 1

RISKS:
- item 1

NEXT_STEPS:
- item 1
`;
};
