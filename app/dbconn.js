const mysql = require("mysql2/promise"); // import mysql

require("dotenv").config({ path: "./.env" }); // import .env files
const mysqlConn = {};
// created connection to database
mysqlConn.bd = {
    sql: mysql.createPool({
        connectionLimit: 10,
        host: process.env.MYSQL_BD_HOST,
        user: process.env.MYSQL_BD_USER,
        password: process.env.MYSQL_BD_PASS,
        database: process.env.IXC_DATABASE,
    }),
    base: "Brasil",
};

mysqlConn.candeias = {
    sql: mysql.createPool({
        connectionLimit: 10,
        host: process.env.MYSQL_CANDEIAS_HOST,
        user: process.env.MYSQL_CANDEIAS_USER,
        password: process.env.MYSQL_CANDEIAS_PASS,
        database: process.env.IXC_DATABASE,
    }),
    base: "candeias",
};
mysqlConn.br364 = {
    sql: mysql.createPool({
        connectionLimit: 10,
        host: process.env.MYSQL_BR364_HOST,
        user: process.env.MYSQL_BR364_USER,
        password: process.env.MYSQL_BR364_PASS,
        database: process.env.IXC_DATABASE,
    }),
    base: "br364",
};
mysqlConn.veronica = {
    sql: mysql.createPool({
        connectionLimit: 10,
        host: process.env.MYSQL_VERONICA_HOST,
        user: process.env.MYSQL_VERONICA_USER,
        password: process.env.MYSQL_VERONICA_PASS,
        database: process.env.VERONICA_DATABASE,
        port: "30360",
    }),
    base: "veronica",
};

module.exports = { mysqlConn };
