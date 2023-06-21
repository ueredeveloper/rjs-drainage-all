import React, { useContext, useEffect, useState } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";
import { Box } from '@mui/material';
import ElemMap from './ElemMap';
import ElemDrawManager from './ElemDrawManager';
import { orange } from '@mui/material/colors';
import { SystemContext } from '../../MainFlow/Analyse';
import ElemMarker from './ElemMarker';


function MapContent() {

  const [mode, setMode] = useState('light');
  const [map, setMap] = useState();

  const [system, setSystem, overlays, setOverlays, shapes, setShapes] = useContext(SystemContext)

  useEffect(() => {
    
  }, [overlays])

  return (
    <Box id="map-box" sx={{ height: '100%', width: '100%' }}>
      <Wrapper apiKey={"AIzaSyDELUXEV5kZ2MNn47NVRgCcDX-96Vtyj0w"} libraries={["drawing"]}>
        <ElemMap mode={mode} map={map} setMap={setMap} zoom={10} center={{ lat: -15.764514558482336, lng: -47.76491209127806 }} />
        <ElemDrawManager map={map} />
        {/*
          overlays.markers.map(markers => {
            
            return markers.points.map((m, ii) => {

              return (
                <ElemMarker
                  key={ii}
                  marker={m}
                  map={map}
                  icon={m.tp_id}
                />)
            })
          })
        */}
      </Wrapper>

    </Box>
  )
}

export default MapContent;