import { Poll } from "../entity/Poll";
export type ElectionPublicationState = {
    isPublished: boolean;
    reviewedAt: Date | null;
    publishedAt: Date | null;
};
export declare const getPublicationState: () => Promise<ElectionPublicationState>;
export declare const initializePublicationState: () => Promise<void>;
export declare const publishElectionResults: () => Promise<Poll>;
export declare const clearPublicationState: () => Promise<void>;
//# sourceMappingURL=electionPublication.d.ts.map