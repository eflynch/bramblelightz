import React, {useState} from 'react';
import {render} from 'react-dom';
import io from 'socket.io-client';

import { ChromePicker } from 'react-color';

const ColorPicker = ({color, setColor}) => {
    return (
        <ChromePicker color={color} disableAlpha={true} onChange={(color)=>{
            setColor(color.hex);
        }}/>
    );
}


const Pixel = ({color, paint, painting}) => {
    return (
        <div className="pixel" style={{
            backgroundColor: color,
            flexGrow: 1,
            margin: 5
        }} onMouseDown={paint} 

        onMouseEnter={(e)=>{
            if (painting) {
                paint();
            }
        }} />
    );
}


const Session = ({pixels, sendCommand}) => {
    const [color, setColor] = useState("#FF0000");
    const [painting, setPainting] = useState(false);

    return (
        <div onMouseDown={(e)=>{setPainting(true);}} onMouseUp={(e)=>{setPainting(false);}} style={{
            height:"90vh", width:"90vw", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"stretch", margin:"auto" 
        }}>
            <div style={{margin: 10}}>
                <ColorPicker color={color} setColor={setColor}/>
            </div>
            <div style={{
                display:"flex",
                flexDirection:"row",
                justifyContent:"space-between",
                flexGrow: 1}}>
                {pixels.map((bar, barIndex)=>{
                    return (
                        <div key={barIndex} style={{display:"flex", flexDirection:"column-reverse", flexGrow: 1}}>
                            {bar.map((pixel, pixelIndex) => {
                                return (
                                    <Pixel key={pixelIndex} color={pixel} painting={painting} paint={()=>{
                                        sendCommand({
                                            bar_index: barIndex,
                                            pixel_index: pixelIndex,
                                            color: color
                                        });
                                    }}/>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


function renderSession(data, sendCommand){
    let {pixels} = data;
    render(<Session pixels={pixels} sendCommand={function(cmd){
        sendCommand(cmd);
    }}/>, document.getElementById("content"));
}


function getSession(){
    const socket = io("/pixels");
    socket.on('connect', () =>{
        socket.emit('join', {});
    });
    socket.on('pixels', (data) => {
        renderSession(data, (cmd) => {
            socket.emit('cmd', cmd);
        });
    });
    document.getElementById("content").innerHTML = "Loading...";
}



document.addEventListener("DOMContentLoaded", function (){
    getSession();
    // renderSession({pixels: [
    //     ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    //     ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    //     ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    //     ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    //     ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    //     ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    //     ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    //     ["#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    // ]});
});
