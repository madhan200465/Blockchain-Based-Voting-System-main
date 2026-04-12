const VOTER_ID_REGEX = /^[A-Z0-9]{6,24}$/;

export const normalizeVoterId = (value?: string | null): string => {
  return (value || "").trim().toUpperCase();
};

export const isValidVoterId = (value?: string | null): boolean => {
  return VOTER_ID_REGEX.test(normalizeVoterId(value));
};

export const generateVoterId = (userId: number): string => {
  return `VOT${String(userId).padStart(6, "0")}`;
};
