
const initialsStates = {
    marker: {
        id: 0,
        // poço manual
        tp_id: 1,
        // subterrâneo
        ti_id: 2,
        int_latitude: -15.775139,
        int_longitude: -47.939599,
    },
    /* desenhos feitos pelo usuário no mapa (cículos, polígonos, retângulos)*/
    overlays: {
        shapes: []

    },
    /* cálculos no subsistema (poroso, fraturado) */
    subsystem: {
        point: {
            // poço manual
            tp_id: 1,
            // subterrâneo
            ti_id: 2,
            lat: -15.775139,
            lng: -47.939599
        },
        markers: [{
            int_latitude: -15.775139,
            int_longitude: -47.939599,
            // poço manual
            tp_id: 1,
            // subterrâneo
            ti_id: 2,
            dt_demanda: { demandas: [] }
        }],

        // selected markers
        sel_markers: [],
        hg_shape: {
            "type": null,
            "coordinates": []
        },
        hg_info: {
            "bacia_nome": "",
            "cod_plan": "",
            "re_cm_ano": 0,
            "sistema": "",
            "uh_codigo": 0,
            "uh_label": "",
            "uh_nome": ""
        },
        hg_analyse: {
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
    /* shapes como unidade hidrográfica, bacia */
    shapes: {
        fraturado: {
            "checked": false,
            "polygons": []
        },
        poroso: {
            "checked": false,
            "polygons": []
        }
    },
    selectedsCharts: {
        "Pluviais": true,
        "Subterrâneas": true,
        "Superficiais": true,
        "Efluentes": true,
        "Barragens": true
    },
    ottoBasins: {
        name: "otto-basins",
        area: 0,
        uhCodigo: "",
        uhLabel: "",
        unNome: ""

    },
    surfaceAnalyse: {

        /**
    * Latitude e longitude de um ponto.
    */
        ll: {
            alias: ['Latitude', 'Longitude'],
            values: { lat: '', lng: '' },
            marker: null
        },
        /**
       * Meses do ano.
       */
        mos: {
            alias: 'Quadro de Vazões (L/s)',
            values: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
            elements: []
        },
        /**
        * Vazão solicitada pelo usuário objeto da análise.
        */
        q_solicitada: {
            columm: 'd18',
            alias: 'QSOLICITADA-SEÇÃO',
            values: [1000,100,100,100,100,100,100,100,100,100,100,100],
            elements: []
        },
        /**
        *	Análise da sessão de captação à montante.
        */
        secao: {
            alias: 'Análise na Seção de Captação',
            meses: {
                alias: 'Quadro de Vazões (L/s)',
                values: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
            },
            area_contribuicao: {
                alias: "Área de contribuição",
                value: 0,
                rings: [],
                elements: []
            },
            /** 
            * Pontos outorgados (marcadores) à montante.
            */
            outorgas: [],

            /**
            * Vazões outorgadas à montante.
            */

            q_outorgada: {
                alias: 'SQOUTORGADA-MONT.-SEÇÃO',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            /**
            * Vazão de referência (regionalizada)
            *
            */
            q_referencia: {
                alias: 'QREFERÊNCIA-SEÇÃO (Regionalizada)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            /**
            * Vazão outorgável, 80% da vazão de referência
            */
            q_outorgavel: {
                alias: 'QOUTORGÁVEL-SEÇÃO (80% QREFERÊNCIA-SEÇÃO)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },

            /**
            * Vazão individual, 20% da outorgável na seção (v_80)
            */
            q_individual: {
                alias: 'QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)',

                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                decimais: [
                    {
                        alias: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)",
                        decimal: 0.20
                    },
                    {
                        alias: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (70% QOUTORGÁVEL-SEÇÃO)",
                        decimal: 0.70
                    },
                    {
                        alias: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (80% QOUTORGÁVEL-SEÇÃO)",
                        decimal: 0.80
                    },
                    {
                        alias: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (90% QOUTORGÁVEL-SEÇÃO)",
                        decimal: 0.90
                    },

                ],
                elements: [],
            },
            /**
            * Vazão disponível na seção.
            */
            q_disponivel: {
                alias: 'QDISPONÍVEL-SEÇÃO',
                values: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], elements: []
            },
            q_sol_q_dis: {
                alias: 'QSOLICITADA-SEÇÃO ≤ QDISPONÍVEL-SEÇÃO',
                values: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            q_sol_q_ind: {
                alias: 'QSOLICITADA-SEÇÃO ≤ QOUTORGÁVEL-INDIVIDUAL-SEÇÃO',
                values: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            }

        },

        /**
    * Análise da Unidade Hidrográfica.
    */
        uh: {
            alias: 'Análise na Unidade Hidrográfica',
            meses: {
                alias: 'Quadro de Vazões (L/s)',
                values: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
            },
            /** 
            * Atributos da UH ao qual pertence o ponto clicado ou digitado.
            */
            attributes: { uh_codigo: '', uh_nome: '' },
            /**
            * Polígono da UH ao qual pertence o ponto.
            */
            rings: [],
            outorgas: [],
            q_outorgada: {
                alias: 'SQOUTORGADA-UH', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            q_referencia: {
                alias: 'QREFERÊNCIA-UH', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            q_remanescente: {
                alias: 'QREMANESCENTE-UH (20% QREFERÊNCIA-UH)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            q_outorgavel: {
                alias: 'QOUTORGÁVEL-UH (80% QREFERÊNCIA-SEÇÃO)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            q_disponivel: {
                alias: 'QDISPONÍVEL-UH',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            q_sol_q_dis: {
                alias: 'QSOLICITADA-SEÇÃO ≤ QDISPONÍVEL-UH',
                values: [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            q_disponibilidade: {
                alias: 'Há disponibilidade hídrica para o usuário?',
                values: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            q_demanda_ajustada: {
                columm: 'd33',
                alias: 'Demanda ajustada...',
                values: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            }

        },

        /**
        *
        *
        *
        */
        //.h_ajuste_bombeamento
        h_ajuste: {
            alias: 'Tabela de ajuste das Horas de Bombeamento',
            values: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
            h_bomb_requerida: {
                columm: 'd46',
                alias: 'Horas de bombeamento (Requerimento)',
                values: [0,0,0,0,0,0,0,0,0,0,0],
                elements: []
            },
            q_secao_m_h: {
                columm: 'd47',
                alias: 'QAJUSTADA-SEÇÃO(m³/h)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []

            },
            q_secao_m_d: {
                columm: 'd48',
                alias: 'QAJUSTADA-SEÇÃO(m³/dia)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            h_bomb_ajustada: {
                columm: 'd49',
                alias: 'Horas de bombeamento (Ajustada)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            }
        },
        /**
        *
        *
        *
        */
        q_modula: {
            alias: 'Tabela final com VAZÃO modulada',
            values: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
            q_outorgada: {
                columm: 'd56',
                alias: 'Q outorgada (L/s)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            h_bombeamento: {
                columm: 'd57',
                alias: 'Horas de Bombeamento (h)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            }
        },
        /**
        *
        *
        *
        */
        h_modula: {
            alias: 'Tabela final com HORA modulada',
            values: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
            q_outorgada: {
                columm: 'd61',
                alias: 'Q outorgada (L/s)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            },
            h_bombeamento: {
                columm: 'd62',
                alias: 'Horas de Bombeamento (h)',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                elements: []
            }
        }

    }

}

export { initialsStates }