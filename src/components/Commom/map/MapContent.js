import React, { useContext, useEffect, useState } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import { Box } from '@mui/material';
import ElemMap from './ElemMap';
import ElemDrawManager from './ElemDrawManager';
import { SystemContext } from '../../MainFlow/Analyse';
import ElemMarker from './ElemMarker';
import ElemInfoWindow from './ElemInfoWindow';
import ElemPopupOverlay from './ElemPopupOverlay';


function MapContent() {

  const [mode, setMode] = useState('light');
  const [map, setMap] = useState();

  const [marker, setMarker, system, setSystem, overlays, setOverlays, shapes, setShapes] = useContext(SystemContext);

  const handleInfoWindowClose = (marker) => {
    console.log('on close')
  };

  useEffect(()=>{
    console.log(overlays)
  }, [overlays])

  return (
    <Box id="map-box" sx={{ height: '100%', width: '100%' }}>
      <Wrapper apiKey={"AIzaSyDELUXEV5kZ2MNn47NVRgCcDX-96Vtyj0w"} libraries={["drawing"]}>
        <ElemMap mode={mode} map={map} setMap={setMap} zoom={10} />
        <ElemDrawManager map={map} />
        <ElemMarker
          info={marker}
          map={map}
        />
        {
          overlays.shapes.map(shape => {
            return ['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'].map(type => {
              if (shape.markers[type] !== null)
                return shape.markers[type].map((marker, i) => {
                  return <ElemMarker
                    key={'marker-' + i}
                    info={marker}
                    map={map}
                  />
                })

            })
          })
        }
        {/*
          overlays.shapes.map(shape => {
            return ['subterranea', 'superficial', 'lancamento_pluviais', 'lancamento_efluentes', 'barragem'].map(type => {
              if (shape.markers[type] !== null)
                return shape.markers[type].map((marker, i) => {
                  return <ElemInfoWindow key={'infowindow-' + i}
                    marker={marker}
                  />
                })

            })
          })*/
        }
        {overlays.shapes.map((shape, i) => {
          return <ElemPopupOverlay key={'popup-' + i} map={shape.map} position={shape.position} content={'conteudo'} draw={shape} />
        })}
      </Wrapper>

    </Box>
  )
}

export default MapContent;