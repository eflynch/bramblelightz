import React from 'react';

const Pixel = ({color, paint, painting}) => {
    return (
        <div className={"pixel" + (paint ? " active" : "")} style={{
            backgroundColor: color,
            flexGrow: 1,
        }} onMouseDown={paint} 

        onMouseEnter={(e)=>{
            if (painting) {
                paint(e);
            }
        }} />
    );
}


export default function({pixels, duration, color, setColor, updatePixel, painting, active, ...props}) {
    return (
        <div {...props}
            style={{
                position:"relative",
                border: active ? "yellow 3px solid" : "white 1px solid",
                borderRadius: 5,
                minWidth: 100,
                margin:10,
                display:"flex",
                flexDirection:"row",
                alignSelf:"stretch",
                flexGrow: 1}}>
                {duration ? <div style={{backgroundColor: "black",position:"absolute", right: 5, top: 5}}>{duration}</div> : undefined}
                {pixels.map((bar, barIndex)=>{
                    return (
                        <div key={barIndex} style={{display:"flex", flexDirection:"column-reverse", flexGrow: 1}}>
                            {bar.map((pixel, pixelIndex) => {
                                const paint = updatePixel ? (e)=>{
                                    if (e.shiftKey) {
                                        setColor(pixel);
                                    } else {
                                        if (color !== pixel) {
                                            updatePixel({
                                                bar_index: barIndex,
                                                pixel_index: pixelIndex,
                                                color: color
                                            });
                                        }
                                    }} : undefined;
                                return (
                                    <Pixel key={pixelIndex} color={pixel} painting={painting} paint={paint} />
                                );
                            })}
                        </div>
                    );
                })}
        </div>
    );
}

