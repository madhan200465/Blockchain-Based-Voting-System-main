import { BaseEntity } from "typeorm";
export declare class User extends BaseEntity {
    id: number;
    name: string;
    citizenshipNumber: string;
    voterId: string | null;
    email: string;
    password: string;
    admin: boolean;
    verified: boolean;
}
//# sourceMappingURL=User.d.ts.map