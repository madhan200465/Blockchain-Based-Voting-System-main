import { Poll } from "../entity/Poll";

export type ElectionPublicationState = {
  isPublished: boolean;
  reviewedAt: Date | null;
  publishedAt: Date | null;
};

export const getPublicationState = async (): Promise<ElectionPublicationState> => {
  const [poll] = await Poll.find({ order: { id: "DESC" }, take: 1 });

  if (!poll) {
    return {
      isPublished: false,
      reviewedAt: null,
      publishedAt: null,
    };
  }

  return {
    isPublished: poll.isPublished,
    reviewedAt: poll.reviewedAt,
    publishedAt: poll.publishedAt,
  };
};

export const initializePublicationState = async () => {
  await Poll.clear();

  const poll = Poll.create({
    name: "current-election",
    isPublished: false,
    reviewedAt: null,
    publishedAt: null,
  });

  await poll.save();
};

export const publishElectionResults = async () => {
  const [poll] = await Poll.find({ order: { id: "DESC" }, take: 1 });

  if (!poll) {
    throw new Error("election publication state not initialized");
  }

  poll.isPublished = true;
  poll.reviewedAt = poll.reviewedAt ?? new Date();
  poll.publishedAt = new Date();

  await poll.save();

  return poll;
};

export const clearPublicationState = async () => {
  await Poll.clear();
};