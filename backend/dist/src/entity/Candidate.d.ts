import { BaseEntity } from "typeorm";
import { Poll } from "./Poll";
export declare class Candidate extends BaseEntity {
    id: number;
    name: string;
    poll: Poll;
}
//# sourceMappingURL=Candidate.d.ts.map