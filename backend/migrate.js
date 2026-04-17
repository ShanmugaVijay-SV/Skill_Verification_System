require("dotenv").config();
const db = require("./config/db");

const addTokenVersionToUsers = `
    ALTER TABLE users
    ADD COLUMN token_version INT DEFAULT 0;
`;

const addUsersEmailRoleIndex = `
    ALTER TABLE users
    ADD INDEX idx_users_email_role (email, role);
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

        await new Promise((resolve, reject) => {
            db.query(addUsersEmailRoleIndex, (err, result) => {
                if (err && err.code !== 'ER_DUP_KEYNAME') {
                    console.error("Error adding users email/role index:", err);
                    reject(err);
                } else {
                    console.log("Successfully added/verified users(email, role) index.");
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