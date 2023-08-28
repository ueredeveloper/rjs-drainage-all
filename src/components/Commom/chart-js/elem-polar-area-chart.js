
import React, { useContext, useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { AnalyseContext } from '../../MainFlow/Analyse';
import { initialState } from '../../../initial-state';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export const data = {
    labels: ['Subterrâneo', 'Superficial', 'Barragem', 'Pluviais', 'Efluentes'],
    datasets: [
        {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
            ],
            borderWidth: 1,
        },
    ],
};

export function ElemPolarAreaChart() {


    const [marker, setMarker, overlays, setOverlays] = useContext(AnalyseContext);
    const [markersLen, setMarkersLen] = useState({
        labels: ['Subterrânea', 'Superficial', 'Pluviais', 'Efluentes', 'Barragem'],
        datasets: [
            {
                label: '',
                data: [50, 100, 70, 20, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderWidth: 1,
            },
        ],
        scales: {
            y: {
                // uso de escala logarítmica ou não
                type: 'logarithmic',
                // position: 'left',

            },
        },
    });



    useEffect(() => {
        overlays.shapes.map(shape => {
            /// console.log(sh.markers['superficial'].length)
            let newDataSets =
                [
                    {
                        label: '',
                        data: [
                            shape.markers.subterranea !== null ? shape.markers.subterranea.length : 0,
                            shape.markers.superficial !== null ? shape.markers.superficial.length : 0,
                            shape.markers.lancamento_pluviais !== null ? shape.markers.lancamento_pluviais.length : 0,
                            shape.markers.lancamento_efluentes !== null ? shape.markers.lancamento_efluentes.length : 0,
                            shape.markers.barragem !== null ? shape.markers.barragem.length : 0
                        ],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                        ],
                        borderWidth: 1,
                    },
                ]



            setMarkersLen(
                prevState => ({
                    ...prevState,
                    //datasets: [...prevState.datasets, { data: newData }]
                    datasets: newDataSets
                }))

        })
    }, [overlays])

    useEffect(() => {
        console.log(markersLen)
    }, [markersLen])


    return <PolarArea style={{ maxHeight: 300 }} data={markersLen} />;
}
