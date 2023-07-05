const { mysqlConn } = require("./dbconn"); // import dbconn
const insertDataSQL = require("./insertData");
const buscaCEP = require("./api"); // import api cep
const utils = require("./utils"); // import utils

//fetch data  from database
const getAllData = async () => {
    // function used for merger the three databases

    const data = async () => {
        let query = `select cep from cliente_contrato where cep != "-" and cep != "00000-000" order by id`;

        let [database1] = await mysqlConn.br364.sql.execute(query),
            [database2] = await mysqlConn.candeias.sql.execute(query),
            [database3] = await mysqlConn.bd.sql.execute(query);

        //close the connections
        mysqlConn.br364.sql.releaseConnection();
        mysqlConn.candeias.sql.releaseConnection();
        mysqlConn.bd.sql.releaseConnection();

        return database1.concat(database2, database3);
    };

    const newdata = await data();

    const cep = [];

    for (const [_idx, value] of newdata.entries()) {
        cep.push(value.cep);
    }
    mysqlConn.br364.sql.end();
    mysqlConn.candeias.sql.end();
    mysqlConn.bd.sql.end();

    return { cep: cep.filter(utils.uniqueCEP) }; // filter unique ceps

    //return data[0];
};

//function to append delay in loop for api requests
function delay(ms) {
    return new Promise((resolve, _reject) => setTimeout(resolve, ms));
}

// Process the data of CEP
const buscaBairros = async () => {
    let initialTime = Date.now();
    const bairros = [];
    const data = await getAllData(); // return processed data of BD
    for (const [idx, value] of data.cep.entries()) {
        await delay(180); // append dalay in the loop between requests
        const fetchedData = await buscaCEP.correiosAPI(value); // return data from API

        //const [dataBairros] = fetchedData.dados;

        utils.printProgress(
            idx,
            data.cep.length * 1,
            `Status tratamento do CEP: `
        ); // retunr progress in %

        if (fetchedData.total === 0) continue; // if error, break the loop and pass to next

        // only tests
        /*
        console.log(
            value || "",
            fetchedData.dados[0].bairro || "",
            fetchedData.dados[0].localidade || ""
        );
        */
        // put the values in veronica
        await mysqlConn.veronica.sql.execute(
            "INSERT IGNORE INTO BAIRRO_CLIENTES_VERONICA(cep, bairro, localidade) VALUES (? ,? , ?)",
            [
                value || "",
                fetchedData.dados[0].bairro || "",
                fetchedData.dados[0].localidade || "",
            ]
        );
    }
    mysqlConn.veronica.sql.end();
    let endTime = Date.now();

    console.log("Terminou em %d segundos", (initialTime - endTime) / 1000);
    //bairros.push(dataBairros.bairro);
};

const contadinha = async () => {
    let query = `select count(id) from cliente where ativo = "S"`;
    let [database1] = await mysqlConn.sql.br364.execute(query),
        [database2] = await mysqlConn.sql.candeias.execute(query),
        [database3] = await mysqlConn.sql.bd.execute(query);

    //close the connections
    mysqlConn.br364.end();
    mysqlConn.candeias.end();
    mysqlConn.bd.end();

    return (
        Object.values(database1[0])[0] +
        Object.values(database2[0])[0] +
        Object.values(database3[0])[0]
    );
};

const formatData = async () => {
    let initialTime = Date.now(); // Used for count the time of execution script

    console.log("Iniciando tratamento de dados"); // Display for user a initializer string

    // Create objects for SQL Query the don't treated datas
    const fromOS = {
            table: "su_oss_chamado",
            query: `id_cliente, id_login, id_assunto, data_abertura, id_tecnico, id_atendente, status, data_fechamento, setor, data_inicio, protocolo, data_reabertura, data_final, data_agenda, id_ticket, id_contrato_kit`,
        },
        fromClient = {
            table: "cliente",
            query: `id, razao, cep, tipo_pessoa, ativo, data_cadastro, Sexo`,
        },
        fromClientContract = {
            table: "cliente_contrato",
            query: `id, id_cliente, status, contrato, id_vendedor, data, data_expiracao, data_cancelamento `,
        },
        fromTicket = {
            table: "su_ticket",
            query: `id, titulo, data_criacao, id_ticket_setor, id_cliente, id_assunto, status, id_responsavel_tecnico, id_usuarios, su_status`,
        },
        fromFuncionarios = {
            table: "funcionarios",
            query: `id, funcionario`,
        },
        fromUsuarios = {
            table: "usuarios",
            query: `id, nome`,
        },
        fromAssuntos = {
            table: "su_oss_assunto",
            query: `id, assunto`,
        },
        fromSetor = {
            table: "su_ticket_setor",
            query: `id, setor`,
        };

    // Connect in the BD for fetching datas
    const getValues = async ({ table, query }) => {
        let [data] = await mysqlConn.bd.sql.query(
            `select ${query} from ${table}`
        );
        let [data2] = await mysqlConn.candeias.sql.query(
            `select ${query} from ${table}`
        );
        let [data3] = await mysqlConn.br364.sql.query(
            `select ${query} from ${table}`
        );
        mysqlConn.bd.sql.releaseConnection();
        mysqlConn.candeias.sql.releaseConnection();
        mysqlConn.br364.sql.releaseConnection();

        data.forEach((elemento) => {
            Object.assign(elemento, { base: mysqlConn.bd.base });
        });
        data2.forEach((elemento) => {
            Object.assign(elemento, { base: mysqlConn.candeias.base });
        });
        data3.forEach((elemento) => {
            Object.assign(elemento, { base: mysqlConn.br364.base });
        });

        return [...data, ...data2, ...data3]; // concatenate tables
    };

    // Initialize constant for posteriorly and create relational tables for input in new DB
    const dataOs = {
            data: await getValues(fromOS).then(console.log(`dataOs is ready`)),
            veronica_table: "su_oss_chamados_all",
        },
        dataClient = {
            data: await getValues(fromClient).then(
                console.log(`dataClient is ready`)
            ),
            veronica_table: "clientes_all",
        },
        dataContract = {
            data: await getValues(fromClientContract).then(
                console.log(`dataContract is ready`)
            ),
            veronica_table: "cliente_contrato_all",
        },
        dataAssunto = {
            data: await getValues(fromAssuntos).then(
                console.log(`dataAssunto is ready`)
            ),
            veronica_table: "",
        },
        dataFuncionarios = {
            data: await getValues(fromFuncionarios).then(
                console.log(`dataFuncionarios is ready`)
            ),
            veronica_table: "",
        },
        dataSetor = {
            data: await getValues(fromSetor).then(
                console.log(`dataSetor is ready`)
            ),
            veronica_table: "",
        },
        dataTicket = {
            data: await getValues(fromTicket).then(
                console.log(`dataTicket is ready`)
            ),
            veronica_table: "su_ticket_all",
        },
        dataUsuarios = {
            data: await getValues(fromUsuarios).then(
                console.log(`dataUsuarios is ready`)
            ),
            veronica_table: "",
        };

    const newOS = []; // for testing
    const newTicket = []; // for testing
    let insertData = []; // Variable store data of object keys of the functions
    let insertKeys = []; // Variable store the objects keys of the functions

    // Function to return CEP os clients in the "cliente" table.
    const clientcep = (client) => {
        return dataClient.data.find((i) => i.id === client)
            ? dataClient.data.find((i) => i.id === client).cep
            : client;
    };

    // Function to treated received data
    const changevalue = (assunto, tecnico, setor, atendente, base) => {
        let obj = {}; // initialize the variable

        // Return the name of Users and append in obj variable
        for (let index = 0; index < dataUsuarios.data.length; index++) {
            // This condition validate if User ID and "Base" they are of same table
            if (
                dataUsuarios.data[index]["id"] == atendente &&
                dataUsuarios.data[index]["base"] == base
            ) {
                //Append "atendente" in obj variable
                Object.assign(obj, {
                    atendente: dataUsuarios.data[index]["nome"],
                });
            }
        }

        // Return the name of employees and append in obj variable
        for (let index = 0; index < dataFuncionarios.data.length; index++) {
            // This condition validate if employee ID and "Base" they are of same table
            if (
                dataFuncionarios.data[index]["id"] == tecnico &&
                dataFuncionarios.data[index]["base"] == base
            ) {
                //Append "tecnico" in obj variable
                Object.assign(obj, {
                    tecnico:
                        dataFuncionarios.data[index]["funcionario"] || null,
                });
            }
        }

        // Return the name of sector and append in obj variable
        for (let index = 0; index < dataSetor.data.length; index++) {
            // This condition validate if sector ID and "Base" they are of same table
            if (
                dataSetor.data[index]["id"] == setor &&
                dataSetor.data[index]["base"] == base
            ) {
                //Append "setor" in obj variable
                Object.assign(obj, {
                    setor: dataSetor.data[index]["setor"],
                });
            }
        }
        // Return the name of subjects and append in obj variable
        return Object.assign(obj, {
            // This condition validate Subject ID and "Base" if match in other notation and append "assunto" in obj variable
            assunto:
                dataAssunto.data.find((i) => i.id === assunto) &&
                dataAssunto.data.find((i) => i.base === base)
                    ? dataAssunto.data.find((i) => i.id === assunto).assunto
                    : assunto,
        });
    };

    // Used for transform "su_oss_chamados" table
    for (const [index, value] of dataOs.data.entries()) {
        // Print progress in percent
        utils.printProgress(
            index,
            dataOs.data.length * 1,
            `Status dos tratamento de Dados de ${dataOs.veronica_table}: `
        );

        // if (index >= 200) {
        //     break;
        // }

        // initialize y variable and append new keys with exist values
        let y = Object.assign(value, {
            cep: clientcep(value.id_cliente),
            assunto: value.id_assunto,
            tecnico: value.id_tecnico,
            atendente: value.id_atendente,
        });
        //console.log(utils.isValidDate(y.data_agenda));

        // Delete old keys and values
        delete y.id_assunto;
        delete y.id_tecnico;
        delete y.id_atendente;

        //console.log(y.atendente);

        // Transform ID values in String
        let newValues = changevalue(
            y.assunto,
            y.tecnico,
            y.setor,
            y.atendente,
            y.base
        );

        // Compare date with reference 1320984000000
        y.data_agenda = utils.alterDate(
            utils.isValidDate(y.data_agenda),
            1320984000000
        );
        y.data_fechamento = utils.alterDate(y.data_fechamento, 1320984000000);
        y.data_abertura = utils.alterDate(y.data_abertura, 1320984000000);
        y.data_inicio = utils.alterDate(
            utils.isValidDate(y.data_inicio),
            1320984000000
        );

        //console.log(newValues);

        // Substitute values after treat data
        y.assunto = newValues.assunto;
        y.tecnico = newValues.tecnico || null;
        y.setor = newValues.setor || null;
        y.atendente = newValues.atendente || y.atendente;

        //newOS.push(y);
        // append valus and keys in two variables
        insertData.push(Object.values(y));
        insertKeys.push(Object.keys(y));

        // execute the data insert in another DB with treated data
        if (index === dataOs.data.length - 1) {
            // Truncate table before insert values
            await mysqlConn.veronica.sql.execute(
                `TRUNCATE ${dataOs.veronica_table}`
            );

            // Call the function for data insert
            await insertDataSQL(
                insertData,
                dataOs.veronica_table,
                insertKeys[0]
            );
        }
    }
    // relese connection pool
    mysqlConn.veronica.sql.releaseConnection();

    insertData = []; //set new value
    insertKeys = []; // set new value

    // Used for transform "cliente" table

    for (const [index, value] of dataClient.data.entries()) {
        // Print progress in percent
        utils.printProgress(
            index,
            dataClient.data.length * 1,
            `Status dos tratamento de Dados de ${dataClient.veronica_table} : `
        );

        // Only tests

        // if (index >= 5) {
        //     break;
        // }

        // append valus and keys in two variables
        insertKeys.push(Object.keys(value));
        insertData.push(Object.values(value));

        if (index === dataClient.data.length - 1) {
            // Truncate table before insert values
            await mysqlConn.veronica.sql.execute(
                `TRUNCATE ${dataClient.veronica_table}`
            );

            // Call the function for data insert
            await insertDataSQL(
                insertData,
                dataClient.veronica_table,
                insertKeys[0]
            );
        }
    }
    // relese connection pool
    mysqlConn.veronica.sql.releaseConnection();

    insertData = [];
    insertKeys = [];

    for (const [index, value] of dataContract.data.entries()) {
        // Print progress in percent
        utils.printProgress(
            index,
            dataContract.data.length * 1,
            `Status dos tratamento de Dados de ${dataContract.veronica_table}: `
        );

        // Only tests

        // if (index >= 5) {
        //     break;
        // }

        // Compare date with reference 1320984000000
        value.data_cancelamento = utils.alterDate(
            value.data_cancelamento,
            1320984000000
        );
        value.data = utils.alterDate(value.data, 1320984000000);
        value.data_expiracao = utils.alterDate(
            value.data_expiracao,
            1320984000000
        );

        // append valus and keys in two variables
        insertKeys.push(Object.keys(value));
        insertData.push(Object.values(value));

        // execute the data insert in another DB with treated data
        if (index === dataContract.data.length - 1) {
            // Truncate table before insert values
            await mysqlConn.veronica.sql.execute(
                `TRUNCATE ${dataContract.veronica_table}`
            );
            // Call the function for data insert
            await insertDataSQL(
                insertData,
                dataContract.veronica_table,
                insertKeys[0]
            );
        }
    }

    // relese connection pool
    mysqlConn.veronica.sql.releaseConnection();

    insertData = []; // set new values
    insertKeys = []; // set new values

    //console.log(insertKeys[0]);
    for (const [index, value] of dataTicket.data.entries()) {
        // Only in test

        // if (index >= 3) {
        //     break;
        // }

        // initialize y variable and append new keys with exist values
        let y = Object.assign(value, {
            cep: clientcep(value.id_cliente), //return CEP string
            setor: value.id_ticket_setor,
            assunto: value.id_assunto,
            res_tecnico: value.id_responsavel_tecnico,
            atendente: value.id_usuarios,
        });

        // Delete old keys and values
        delete y.id_responsavel_tecnico;
        delete y.id_usuarios;
        delete y.id_ticket_setor;
        delete y.id_assunto;

        // Transform ID values in String
        let newValues = changevalue(
            y.assunto,
            y.res_tecnico,
            y.setor,
            y.atendente,
            y.base
        );

        // Substitute values after treat data
        y.res_tecnico = newValues.tecnico || null;
        y.setor = newValues.setor || null;
        y.assunto = newValues.assunto || null;
        y.atendente = newValues.atendente || null;

        // Print progress in percent
        utils.printProgress(
            index,
            dataTicket.data.length * 1,
            `Status dos tratamento de Dados de ${dataTicket.veronica_table}: `
        );

        // append valus and keys in two variables
        insertData.push(Object.values(y));
        insertKeys.push(Object.keys(y));

        // execute the data insert in another DB with treated data
        if (index === dataTicket.data.length - 1) {
            // Truncate table before insert values
            await mysqlConn.veronica.sql.execute(
                `TRUNCATE ${dataTicket.veronica_table}`
            );
            // Call the function for data insert
            await insertDataSQL(
                insertData,
                dataTicket.veronica_table,
                insertKeys[0]
            );
        }
    }

    // relese connection pool
    mysqlConn.veronica.sql.releaseConnection();

    //console.log(newTicket);

    // End connection pool
    mysqlConn.veronica.sql.end();
    mysqlConn.bd.sql.end();
    mysqlConn.candeias.sql.end();
    mysqlConn.br364.sql.end();

    let endTime = Date.now(); // used for calculate time of execution script

    console.log("\n\nTerminou em %d segundos", (endTime - initialTime) / 1000);
};

formatData(); // Call the master function
