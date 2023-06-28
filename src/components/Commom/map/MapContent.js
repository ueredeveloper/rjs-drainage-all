import React, { useContext, useEffect, useState } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import { Box } from '@mui/material';
import ElemMap from './ElemMap';
import ElemDrawManager from './ElemDrawManager';
import { orange } from '@mui/material/colors';
import { SystemContext } from '../../MainFlow/Analyse';
import ElemMarker from './ElemMarker';
import ElemInfoWindow from './ElemInfoWindow';
import { InfoWindow } from '@googlemaps/react-wrapper';


function MapContent() {

  const [mode, setMode] = useState('light');
  const [map, setMap] = useState();

  const [marker, setMarker, system, setSystem, overlays, setOverlays, shapes, setShapes] = useContext(SystemContext)

  return (
    <Box id="map-box" sx={{ height: '100%', width: '100%' }}>
      <Wrapper apiKey={"AIzaSyDELUXEV5kZ2MNn47NVRgCcDX-96Vtyj0w"} libraries={["drawing"]}>
        <ElemMap mode={mode} map={map} setMap={setMap} zoom={10} />
        <ElemDrawManager map={map} />
        <ElemMarker
          marker={marker}
          setMarker={setMarker}
          map={map}
        />

        {
          ['subterranea_json', 'superficial_json', 'lancamento_json', 'barragem_json'].map(type => {
            return overlays.markers.map(markers => {
              return markers[type].map((marker, ii) => {
                return <ElemMarker
                  key={'marker_' + ii}
                  marker={marker}
                  setMarker={setMarker}
                  map={map}
                />
              })
            })
          })

        }
        {/*
          overlays.shapes.map((draw, i) => {
            if (draw.map !== null) {
              return <ElemInfoWindow key={'shape_' + i} draw={draw} />
            }
          })*/
        }
      </Wrapper>

    </Box>
  )
}

export default MapContent;