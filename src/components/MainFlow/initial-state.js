import { initial_state_grants } from "./initial-state-grants"

const initialState = {
    "overlays": {
        "markers": initial_state_grants,
        "circles": [],
        "polygons": [],
        "rectangles": []
    },
    "system": {
        "point": {
            tp_id: 1,
            lat: -15.775139,
            lng: -47.939599
        },
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