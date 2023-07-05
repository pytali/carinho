const utils = require("./utils"); // import utils
const { mysqlConn } = require("./dbconn"); // import dbconn

// Function to insert new bulk data in the other DB using chunk
const insertDataSQL = async (data, data_table, keys) => {
    // Initialize variables and define the chunk size
    let i,
        j,
        temparray,
        chunk = 1000;

    // Loop with chunk data
    for (i = 0, j = data.length; i < j; i += chunk) {
        // Display message log in the fist loop
        if ((i + chunk) / chunk === 1) {
            console.log(`\n\nStart ${data_table} input to VeronicaDB: \n`);
        }
        // Print progress in percent
        utils.printProgress(
            (i + chunk) / chunk,
            Math.ceil(j / chunk),
            `Bloco de ${chunk} linhas para o DB: `
        );

        // Define temparray for chunk insert in mysql
        temparray = data.slice(i, i + chunk);

        // Insert values in bulk to Veronica Db
        await mysqlConn.veronica.sql.query(
            `INSERT INTO ${data_table}(${keys}) VALUES ?`,
            [temparray]
        );
    }

    // Release the Veronica pool
    mysqlConn.veronica.sql.releaseConnection();
};

// export module
if (typeof module != "undefined") {
    module.exports = insertDataSQL;
}
