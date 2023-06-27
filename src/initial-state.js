
const grants = [
    {
        "subterranea_json": [
            {
                "id": 1881,
                "ti_id": 2,
                "tp_id": 1,
                "us_nome": "MARCOS LUIZ SANTAROSA",
                "us_cpf_cnpj": "20942478649",
                "emp_endereco": "RUA 08, CHACARA 185/186, NUCLEO RURAL LAGO OESTE, TUBULAR",
                "int_latitude": -15.617642,
                "int_processo": "197000139/2006",
                "int_longitude": -47.948299
            },
            {
                "id": 1851,
                "ti_id": 2,
                "tp_id": 2,
                "us_nome": "MARIA APARECIDA DE OLIVEIRA YUNG",
                "us_cpf_cnpj": "22398899187",
                "emp_endereco": "RUA 05, CHÁCARA 68, CANELA DA EMA - NÚCLEO RURAL LAGO OESTE",
                "int_latitude": -15.617691,
                "int_processo": "197000229/2006",
                "int_longitude": -47.930311
            }
        ],
        "superficial_json": [
            {
                "id": 2378,
                "ti_id": 1,
                "us_nome": "FRANCISCA DE SOUZA TAVARES GOMES",
                "us_cpf_cnpj": "24852198187",
                "emp_endereco": "CHÁCARA 2",
                "int_latitude": -15.630604,
                "int_processo": "19700003547/2018",
                "int_longitude": -47.796197
            },
            {
                "id": 2388,
                "ti_id": 1,
                "us_nome": "WALMAR DE ALMEIDA PASSOS",
                "us_cpf_cnpj": "69081573187",
                "emp_endereco": "DF 440, CA 43 (VIDEIRAS HOTEL FAZENDA)",
                "int_latitude": -15.673307,
                "int_processo": "19700002606/2018",
                "int_longitude": -47.775775
            }
        ],
        "barragem_json": [
            {
                "id": 3,
                "ti_id": 5,
                "us_nome": "ASSOCIAÇÃO DOS MORADORES DO CÓRREGO JERIVÁ",
                "us_cpf_cnpj": "18333962000128",
                "emp_endereco": "NÚCLEO RURAL CÓRREGO DO JERIVÁ, MI 03, CONJUNTO 01, CASA 3A",
                "int_latitude": -15.717467,
                "int_processo": "0197-000842/2013",
                "int_longitude": -47.844918
            },
            {
                "id": 15,
                "ti_id": 5,
                "us_nome": "COMPANHIA DE SANEAMENTO AMBIENTAL DO DISTRITO FEDERAL - CAESB",
                "us_cpf_cnpj": "00082024000137",
                "emp_endereco": "BARRAGEM DO TORTO (BAR.TOR.001) PARQUE NACIONAL DE BARSILIA -BRASÍLIA/DF",
                "int_latitude": -15.695,
                "int_processo": "197000477/2012",
                "int_longitude": -47.911944
            },
          
        ],
        "lancamento_json": [
            {
                "id": 10,
                "ti_id": 4,
                "us_nome": "COMPANHIA DE SANEAMENTO AMBIENTAL DO DISTRITO FEDERAL - CAESB",
                "us_cpf_cnpj": "00082024000137",
                "emp_endereco": "ETE - SOBRADINHO",
                "int_latitude": -15.660613,
                "int_processo": "197000678/2006",
                "int_longitude": -47.81269
            },
            {
                "id": 19,
                "ti_id": 4,
                "us_nome": "FUNDAÇÃO UNIVERSIDADE DE BRASÍLIA - CAMPUS UNIVERSITÁRIO DARCY RIBEIRO",
                "us_cpf_cnpj": "38174000143",
                "emp_endereco": "ESTAÇÃO EXPERIMENTAL DE BIOLOGIA  - LAGO PARANOÁ",
                "int_latitude": -15.735494,
                "int_processo": "197001368/2015",
                "int_longitude": -47.881302
            },
            {
                "id": 25,
                "ti_id": 4,
                "us_nome": "URBANIZADORA PARANOAZINHO S.A",
                "us_cpf_cnpj": "09615218000125",
                "emp_endereco": "FASE 1 (URBS 1 E 2) DO PROJETO DE URBANIZAÇÃO DA FAZENDA PARANOAZINHO",
                "int_latitude": -15.667513,
                "int_processo": "0197-000630/2017",
                "int_longitude": -47.806788
            },
            {
                "id": 35,
                "ti_id": 4,
                "us_nome": "NORTE BRASÍLIA EMPREENDIMENTOS IMOBILIÁRIOS LTDA",
                "us_cpf_cnpj": "19154205000150",
                "emp_endereco": "SETOR HABITACIONAL MANSÕES SOBRADINHO, ENTRONCAMENTO ENTRE AS RODOVIAS DF-150 E DF-420",
                "int_latitude": -15.637468,
                "int_processo": "19700005314/2018",
                "int_longitude": -47.854439
            }
        ]
    }
]

const initialState = {
    "marker": {
        id: 0,
        type: 'marker',
        ti_id: 2,
        tp_id: 1,
        int_latitude: -15.7745922,
        int_longitude: -47.9403749,
        dt_demanda: { demandas: [] }
    },
    "overlays": {
        "markers": grants,
        "shapes": []
    },
    "system": {
        "markers": [{
            int_latitude: -15.775139,
            int_longitude: -47.939599,
            dt_demanda: { demandas: [] }
        }],
        // selected markers
        "sel_markers": [],
        "hg_shape": {
            "type": null,
            "coordinates": []
        },
        "hg_info": {
            "bacia_nome": "",
            "cod_plan": "",
            "re_cm_ano": 0,
            "sistema": "",
            "uh_codigo": 0,
            "uh_label": "",
            "uh_nome": ""
        },
        "hg_analyse": {
            "uh": "",
            "sistema": "",
            "cod_plan": "",
            "q_ex": 0,
            "n_points": 0,
            "q_points": 0,
            "q_points_per": 0,
            "vol_avaiable": 0
        }
    },
    "shapes": {
        "fraturado": {
            "checked": false,
            "polygons": []
        },
        "poroso": {
            "checked": false,
            "polygons": []
        }
    }
}

export { initialState }