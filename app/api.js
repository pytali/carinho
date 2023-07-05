// API APICEP ( um pouco limitada)
const apicep = async (cep) => {
    const fetchDataCEP = await fetch(
        `https://ws.apicep.com/cep/${cep.replace("-", "")}.json"` // trata os CEPs, retirando o "-"
    )
        .then((reponse) => reponse.json())
        .catch((error) => console.error(error));

    return fetchDataCEP;
};

// API Site correios
const correiosAPI = async (cep) => {
    const fetchDataCorreios = await fetch(
        "https://buscacepinter.correios.com.br/app/cep/carrega-cep.php",
        {
            method: "post",

            headers: {
                Accept: "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                Connection: "keep-alive",
                "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: `mensagem_alerta=&cep=${cep}&cepaux=`,
            redirect: "follow",
        }
    ).then((data) => data.json());
    return fetchDataCorreios;
};
module.exports = { apicep, correiosAPI };
