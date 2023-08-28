
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

export function ElemPolarAreaChart() {


    const [marker, setMarker, overlays, setOverlays] = useContext(AnalyseContext);
    const [numberOfGrants, setNumberOfGrants] = useState({
        labels: ['Subterrânea', 'Superficial', 'Pluviais', 'Efluentes', 'Barragem'],
        datasets: [
            {
                label: '',
                data: [100, 50, 25, 70, 60],
                
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderWidth: 1,
                //hidden: [false, false, false, false, false],
                
            },
        ],

    });

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        //console.log(numberOfGrants.labels[context.dataIndex])
                        //const hiddenIndex = numberOfGrants.labels.indexOf("Subterrânea");
                        //console.log(hiddenIndex)
                       /* if (hiddenIndex !== -1) {
                            numberOfGrants.datasets[0].data.splice(hiddenIndex, 1);
                            //numberOfGrants.datasets[0].backgroundColor.splice(hiddenIndex, 1);
                            //numberOfGrants.datasets[0].borderColor.splice(hiddenIndex, 1);
                          }*/
                        const originalValue = numberOfGrants.datasets[0].data[context.dataIndex];
                        return `Qt: ${originalValue}`;
                    },
                },
            },
        },
        scale: {
            ticks: {
                display: true
            }
        },
    }

    const logarithmicData = numberOfGrants.datasets[0].data.map((value) => Math.log10(value));

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
                            'rgba(4,12,157,0.5)',
                            'rgba(1,147,103,0.5)',
                            'rgba(227,171,0,0.5)',
                            'rgba(157,4,113, 0.5)',
                            'rgba(189,176,26,0.5)'
                        ],
                        borderWidth: 1,
                    },
                ]



            setNumberOfGrants(
                prevState => ({
                    ...prevState,
                    //datasets: [...prevState.datasets, { data: newData }]
                    datasets: newDataSets
                }))

        })
    }, [overlays])

    useEffect(() => {
        console.log(numberOfGrants.datasets[0])
    }, [numberOfGrants])


    return <PolarArea style={{ maxHeight: 300 }}
        data={{
            ...numberOfGrants,
            datasets: [{ ...numberOfGrants.datasets[0], data: numberOfGrants.datasets[0].data.map((value) => Math.log10(value)) }],
        }}
        options={options} />;
}
