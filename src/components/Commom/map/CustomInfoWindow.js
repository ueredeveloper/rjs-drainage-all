import React from 'react';
import { InfoWindow } from '@googlemaps/react-wrapper';

const CustomInfoWindow = ({ marker, onClose }) => {


  return (
    <InfoWindow
      onClose={() => onClose(marker)}
    >
      {/* Content of the InfoWindow */}
      <div>
        <h3>marker</h3>
        <p>paragraph</p>
      </div>
    </InfoWindow>
  );
};

export default CustomInfoWindow;
