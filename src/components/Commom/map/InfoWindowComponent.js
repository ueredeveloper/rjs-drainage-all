import React, { useState } from 'react';
import { InfoWindow } from '@googlemaps/react-wrapper';

const InfoWindowComponent = () => {
  const [infoWindowVisible, setInfoWindowVisible] = useState(false);

  const toggleInfoWindow = () => {
    setInfoWindowVisible(!infoWindowVisible);
  };

  return (
    <>
      <button onClick={toggleInfoWindow}>
        {infoWindowVisible ? 'Close Info Window' : 'Open Info Window'}
      </button>
      <InfoWindow
        position={{ lat: -15.7745922, lng: -47.9403749 }}
        visible={infoWindowVisible}
        onCloseClick={toggleInfoWindow}
      >
        <div>
          <h1>Info Window Content</h1>
          <p>This is the content of the info window.</p>
        </div>
      </InfoWindow>
    </>
  );
};

export { InfoWindowComponent };
