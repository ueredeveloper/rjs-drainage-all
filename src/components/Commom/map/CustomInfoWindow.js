import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';


const CustomInfoWindow = ({ position }) => {
    const [infoWindowContent, setInfoWindowContent] = useState(null);
    const infoWindowRef = useRef(null);
  
    useEffect(() => {
      const container = document.createElement('div');
      ReactDOM.render(<InfoWindowContent />, container);
      setInfoWindowContent(container);
    }, []);
  
    useEffect(() => {
      if (infoWindowContent && marker) {
        const infowindow = new window.google.maps.InfoWindow();
  
        infowindow.setContent(infoWindowContent);
  
        infowindow.addListener('closeclick', onCloseClick);
        infowindow.open(marker.getMap(), marker);
  
        // Store the reference to infoWindow object for further interaction if needed
        infoWindowRef.current = infowindow;
      }
    }, [infoWindowContent, marker, onCloseClick]);
  
    return null;
  };