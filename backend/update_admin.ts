import { createConnection } from "typeorm";
import { User } from "./src/entity/User";
import bcrypt from "bcrypt";

createConnection({
  "type": "sqlite",
  "database": "bbvs.sqlite",
  "entities": ["src/entity/**/*.ts"]
}).then(async connection => {
    const admin = await User.findOne({ email: "john1@gmail.com" });
    if (admin) {
        admin.password = await bcrypt.hash("admin123", 10);
        admin.verified = true;
        await User.save(admin);
        console.log("Admin John1 updated with password: admin123");
    } else {
        console.log("Admin John1 not found");
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
