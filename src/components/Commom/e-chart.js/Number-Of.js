import React, { useState, useMemo, useCallback, useEffect } from 'react';

import * as echarts from 'echarts';

// Child component
const ChildComponent = React.memo(({ overlays, setOverlays, handleClickSetParams }) => {

    const [_selectedShapes, _setSelectedShapes] = useState([]);

    const [params, setParams] = useState({})



    function convertOptionsDataName(shapeName) {
        switch (shapeName) {
            case 'subterranea':
                return 'Subterrâneas';

            case 'superficial':
                return 'Superficiais';

            case 'lancamento_pluviais':
                return 'Pluviais';

            case 'lancamento_efluentes':
                return 'Efluentes';

            case 'barragem':
                return 'Barragens';
        }
    }
    function convertToShapeName(dataName) {
        switch (dataName) {
            case 'Subterrâneas':
                return 'subterranea';
            case 'Superficiais':
                return 'superficial';
            case 'Pluviais':
                return 'lancamento_pluviais';
            case 'Efluentes':
                return 'lancamento_efluentes';
            case 'Barragens':
                return 'barragem';
        }
    }
    const [options, setOptions] = useState({
        legend: {
            top: 'top',
            selected: params.selected,
        },
        toolbox: {
            show: true,
            feature: {
                mark: { show: true },
                dataView: { show: true, readOnly: false },
                restore: { show: true },
                saveAsImage: { show: false }
            }
        },
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                name: '',
                type: 'pie',
                radius: [50, 100],
                center: ['50%', '50%'],
                roseType: 'area',
                itemStyle: {
                    borderRadius: 8
                },
                data: [
                    { value: 0, name: 'Subterrâneas' },
                    { value: 0, name: 'Superficiais' },
                    { value: 0, name: 'Pluviais' },
                    { value: 0, name: 'Efluentes' },
                    { value: 0, name: 'Barragens' }
                ]

            }
        ]
    });

    const handleClick = useCallback((event) => {

        handleClickSetParams(prevParams => ({
            ...prevParams,
            selected: {
                ...prevParams.selected,
                [event.name]: event.selected[event.name]
            }
        }));

    }, []);


    useEffect(() => {
        // Cria uma instância do ECharts
        const myChart = echarts.init(document.getElementById('myChart'));

        // Define as opções para o gráfico
        myChart.setOption(options);

        myChart.on('legendselectchanged', function (event) {

            handleClick(event)

            let keys = Object.keys(event.selected)

            keys.forEach((key) => {
                //console.log(key, event.selected[key])

                let shapeName = convertToShapeName(key);
                if (event.selected[key] === true) {

                    _setSelectedShapes(prev => {
                        // verifica se existe o nome selecionado, se existir retira
                        const selecteds = prev.filter(s => s !== shapeName)
                        // inclui nome selecionado
                        return [...selecteds, shapeName]

                    })
                } else {
                    _setSelectedShapes(prev => {
                        // filtra para retirar nome não selecionado
                        return [...prev.filter(prev => prev != shapeName)]
                    })
                }
            })

            //setSelectedShapes(_selectedShapes)

        });




        // Limpa a instância do gráfico quando o componente é desmontado
        return () => {
            myChart.dispose();
        };
    }, []);

    useEffect(() => {

        overlays.shapes.map(shape => {
            let newData = ['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'].map((shapeName, i) => {
                let _data = options.series[0].data.find(item => item.name === convertOptionsDataName(shapeName))
                if (shape.markers[shapeName] !== null) {
                    return { ..._data, value: shape.markers[shapeName].length };
                }
                return { ..._data, value: 0 };
            });
            const newOptions = { ...options }; // Create a copy of options
            newOptions.series[0].data = newData; // Update data with new values
            setOptions(newOptions); // Update state with new options

        });

        /*
        if (params && params.selected) {
          let keys = Object.keys(params.selected)
    
          keys.forEach(key => {
            console.log(key, params.selected[key])
    
            let shapeName = convertToShapeName(key);
            setOverlays(prevState => {
    
              const newShapes = prevState.shapes.map(shape => {
                if (shape.markers) {
                  const newMarkers = {
                    ...shape.markers,
    
                    [shapeName]: null 
                    //event.selected[key] === false ? null : shape.markers[shapeName], // Replace the table array with the new object
                  };
                  return { ...shape, markers: newMarkers };
                }
                return shape;
              });
    
              return { ...prevState, shapes: newShapes };
            });
          })
        }*/
    }, [overlays, params]);

    return (
        <div id="myChart" style={{ marginTop: 20, width: '100%', height: '300px' }}></div>
    );
});

export default ChildComponent