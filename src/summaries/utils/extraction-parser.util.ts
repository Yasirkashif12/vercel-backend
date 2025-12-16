export interface ExtractedData {
  actionItems: string[];
  risks: string[];
  nextSteps: string[];
}

export const parseExtractionResponse = (response: string): ExtractedData => {
  const result: ExtractedData = {
    actionItems: [],
    risks: [],
    nextSteps: [],
  };

  try {
    const sections = response.split(/(?=ACTION_ITEMS:|RISKS:|NEXT_STEPS:)/);

    sections.forEach((section) => {
      const trimmed = section.trim();

      let key: keyof ExtractedData | null = null;
      if (trimmed.startsWith('ACTION_ITEMS:')) key = 'actionItems';
      if (trimmed.startsWith('RISKS:')) key = 'risks';
      if (trimmed.startsWith('NEXT_STEPS:')) key = 'nextSteps';

      if (!key) return;

      const items = trimmed
        .split('\n')
        .filter((line) => line.trim().startsWith('-'))
        .map((line) => line.replace(/^-\s*/, '').trim());

      if (items.length > 0) result[key] = items;
    });

    if (!result.actionItems.length)
      result.actionItems.push('No specific action items identified');
    if (!result.risks.length) result.risks.push('No risks identified');
    if (!result.nextSteps.length)
      result.nextSteps.push('No next steps identified');
  } catch {
    return {
      actionItems: ['Unable to extract action items'],
      risks: ['Unable to extract risks'],
      nextSteps: ['Unable to extract next steps'],
    };
  }

  return result;
};
