export const extractGithubUsername = (input: string): string => {
  let cleanInput = input;

  if (cleanInput.startsWith("@")) {
    cleanInput = cleanInput.substring(1);
  }

  cleanInput = cleanInput.replace(/\/$/, "");

  const urlRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)/i;

  const match = cleanInput.match(urlRegex);

  if (match && match[1]) {
    return match[1];
  }
  return cleanInput;
};
