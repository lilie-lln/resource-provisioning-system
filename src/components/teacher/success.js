import React from 'react';
import { useLocation } from 'react-router-dom';

function Success() {
  const location = useLocation();
  const { selectedSlots, resourceRequirements } = location.state || {};

  return (
    <div className='successpart'>
      <h1>排程已完成!請於選定時段登入本系統進行使用!</h1>
      <h2>選定時段：</h2>
      <ul>
        {selectedSlots && selectedSlots.length > 0 ? (
          selectedSlots.map((slot, index) => <li key={index}>{slot}</li>)
        ) : (
          <p>No slots selected.</p>
        )}
      </ul>
      <h2>資源配置：</h2>
      {resourceRequirements ? (
        <ul>
          <li>CPU: {resourceRequirements.cpu}</li>
          <li>GPU: {resourceRequirements.gpu}</li>
          <li>Memory: {resourceRequirements.mem}</li>
        </ul>
      ) : (
        <p>No resource requirements specified.</p>
      )}
      <h2></h2>
    </div>
  );
}

export default Success;
