import React, {useRef, useEffect} from 'react';

const InfoWindowContent = ({ title, description, onButtonClicked }) => {
  /*  const buttonRef = useRef("button");
  
    useEffect(() => {
      if (buttonRef.current) {
        console.log('if buttonRef')
       // buttonRef.current.addEventListener('click', console.log('clicked use ref'));
      
      }
    }, []);*/
  
    return (
      <div>
        <h3 id='demo'>{title}</h3>
        <p>{description}</p>
        <button id="info-window-button">Buscar Outogas</button>
      </div>
    );
  };

  export default InfoWindowContent