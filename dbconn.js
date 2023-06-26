const mysql = require("mysql2/promise"); // import mysql

require("dotenv").config({ path: "./.env" }); // import .env files
const mysqlConn = {};
// created connection to database
mysqlConn.bd = mysql.createPool({
    host: process.env.MYSQL_BD_HOST,
    user: process.env.MYSQL_BD_USER,
    password: process.env.MYSQL_BD_PASS,
    database: process.env.IXC_DATABASE,
});
mysqlConn.candeias = mysql.createPool({
    host: process.env.MYSQL_CANDEIAS_HOST,
    user: process.env.MYSQL_CANDEIAS_USER,
    password: process.env.MYSQL_CANDEIAS_PASS,
    database: process.env.IXC_DATABASE,
});
mysqlConn.br364 = mysql.createPool({
    host: process.env.MYSQL_BR364_HOST,
    user: process.env.MYSQL_BR364_USER,
    password: process.env.MYSQL_BR364_PASS,
    database: process.env.IXC_DATABASE,
});
mysqlConn.veronica = mysql.createPool({
    host: process.env.MYSQL_VERONICA_HOST,
    user: process.env.MYSQL_VERONICA_USER,
    password: process.env.MYSQL_VERONICA_PASS,
    database: process.env.VERONICA_DATABASE,
    port: "30360",
});

module.exports = { mysqlConn };
