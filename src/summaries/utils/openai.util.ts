export const extractMessageContent = (response: any, fallback = ''): string => {
  return response?.choices?.[0]?.message?.content ?? fallback;
};
