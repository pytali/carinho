const { mysqlConn } = require("./dbconn"); // import dbconn

const buscaCEP = require("./api"); // import api cep
const utils = require("./utils"); // import utils

//function to filter uniques CEPs
const uniqueCEP = (value, index, array) => {
    return array.indexOf(value) === index;
};

//fetch data  from database
const getAllData = async () => {
    // function used for merger the three databases
    const data = async () => {
        let query = `select id, cep from cliente where cep != "-" and cep != "00000-000" order by id`;
        let [database1] = await mysqlConn.br364.execute(query),
            [database2] = await mysqlConn.candeias.execute(query),
            [database3] = await mysqlConn.bd.execute(query);

        //close the connections
        mysqlConn.br364.end();
        mysqlConn.candeias.end();
        mysqlConn.bd.end();

        return database1.concat(database2, database3);
    };

    const newdata = await data();

    const cep = [];

    for (const [_idx, value] of newdata.entries()) {
        cep.push(value.cep);
    }

    return { cep: cep.filter(uniqueCEP) }; // filter unique ceps

    //return data[0];
};

//function to append delay in loop for api requests
function delay(ms) {
    return new Promise((resolve, _reject) => setTimeout(resolve, ms));
}

// trata os dados de cep
const buscaBairros = async () => {
    const bairros = [];
    const data = await getAllData(); // retorna os dados do banco
    for (const [idx, value] of data.cep.entries()) {
        await delay(180); // aplica um delay entre 1 e outra requisicao
        const fetchedData = await buscaCEP.correiosAPI(value); // return data from API

        //const [dataBairros] = fetchedData.dados;

        utils.printProgress(idx, data.cep.length * 1); // retunr progress in %

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
        await mysqlConn.veronica.execute(
            "INSERT IGNORE INTO BAIRRO_CLIENTES_VERONICA(cep, bairro, localidade) VALUES (? ,? , ?)",
            [
                value || "",
                fetchedData.dados[0].bairro || "",
                fetchedData.dados[0].localidade || "",
            ]
        );
    }
    mysqlConn.veronica.end();
    //bairros.push(dataBairros.bairro);
};
//console.log(bairros);
buscaBairros(); // inicia a funcao
