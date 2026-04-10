import { createConnection } from "typeorm";
import { User } from "./src/entity/User";

createConnection({
  "type": "sqlite",
  "database": "bbvs.sqlite",
  "entities": ["src/entity/**/*.ts"]
}).then(async connection => {
    const users = await User.find();
    users.forEach(u => {
        console.log(`U|${u.id}|${u.name}|${u.email}|${u.citizenshipNumber}|${u.admin}|${u.verified}`);
    });
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
