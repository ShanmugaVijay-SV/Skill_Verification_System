require("dotenv").config();
const db = require("./config/db");

const addTokenVersionToUsers = `
    ALTER TABLE users
    ADD COLUMN token_version INT DEFAULT 0;
`;

const executeMigrations = async () => {
    console.log("Starting DB Migrations...");
    try {
        await new Promise((resolve, reject) => {
            db.query(addTokenVersionToUsers, (err, result) => {
                if (err && err.code !== 'ER_DUP_FIELDNAME') {
                    console.error("Error adding to users:", err);
                    reject(err);
                } else {
                    console.log("Successfully added/verified token_version on users table.");
                    resolve();
                }
            });
        });

        console.log("Migrations completed.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

executeMigrations();