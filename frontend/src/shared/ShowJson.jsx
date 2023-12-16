import * as React from 'react';
import './styles.css'; // Import your stylesheet

export default function ShowJson({jsonData}) 
{
  return (
    <div className="json-display-container">
      <pre>{JSON.stringify(jsonData, null, 2)}</pre>
    </div>
  );
}