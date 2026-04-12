import { BaseEntity } from "typeorm";
import { Candidate } from "./Candidate";
export declare class Poll extends BaseEntity {
    id: number;
    name: string;
    isPublished: boolean;
    reviewedAt: Date | null;
    publishedAt: Date | null;
    candidates: Candidate[];
}
//# sourceMappingURL=Poll.d.ts.map