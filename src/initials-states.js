
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

    }
}

export { initialsStates }