import React, { useState } from 'react';

import Controls from './controls';
import Frame from './frame';

export default function({pixels, duration, updateDuration, updatePixel}) {
    const [color, setColor] = useState("#FF0000");
    const [painting, setPainting] = useState(false);

    return (
        <div style={{display: "flex", flexGrow: 5, alignSelf:"stretch"}} >
            <Controls duration={duration} setDuration={updateDuration} color={color} setColor={setColor} />
            <div style={{display: "flex", flexGrow: 8, alignSelf:"stretch"}}
                onMouseUp={(e)=>{setPainting(false);}}
                onMouseDown={(e)=>{setPainting(true);}}>
                <Frame pixels={pixels} setColor={setColor} color={color} painting={painting} updatePixel={updatePixel} />
            </div>
        </div>
    );

};
