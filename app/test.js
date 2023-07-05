// for (i = 0, j = insert_data.length; i < j; i += chunk) {
//     utils.printProgress(
//         (i + chunk) / chunk,
//         Math.ceil(j / chunk),
//         `Bloco de ${chunk} linhas para o DB: `
//     );

//     temparray = insert_data.slice(i, i + chunk);

//     //console.log(temparray);

//     //console.log((i + chunk) / chunk);
//     //console.log(j);
//     //console.log(chunk);

//     await mysqlConn.veronica.query(
//         "INSERT INTO su_ticket_all(id, titulo, data_criacao, id_cliente, status, base, cep, setor, res_tecnico, atendente) VALUES ?",
//         [temparray]
//     );
//     //console.log(temparray);
// }

console.log(Date.parse("2000-01-01 00:00:00"));
console.log(Date.parse("2011-11-11 00:00:00"));
