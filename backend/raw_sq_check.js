const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bbvs.sqlite');

db.all("SELECT * FROM user", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        rows.forEach(u => {
            console.log(`U|${u.id}|${u.name}|${u.email}|${u.citizenshipNumber}|${u.admin}|${u.verified}`);
        });
    }
    db.close();
});
