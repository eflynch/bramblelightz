import React, {useState} from 'react';
import {render} from 'react-dom';
import io from 'socket.io-client';

import { SliderPicker } from 'react-color';

const ColorPicker = ({color, setColor}) => {
    return (
        <SliderPicker color={color} onChangeComplete={(color)=>{
            setColor(color.hex);
        }}/>
    );
}


const Pixel = ({color, onClick, newColor, barIndex, pixelIndex, sendCommand}) => {
    return (
        <div className="pixel" style={{
            backgroundColor: color,
            width: 30,
            flexGrow: 1
        }} onClick={(e)=>{onClick();}} />
    );
}


const Session = ({pixels, sendCommand}) => {
    const [color, setColor] = useState("#FF0000");

    return (
        <div style={{height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
            <div style={{ width: "80vh", margin: 10}}>
                <ColorPicker color={color} setColor={setColor}/>
            </div>
            <div style={{
                display:"flex",
                flexDirection:"row",
                justifyContent:"space-between",
                width: "80vh",
                height: "80vh"}}>
                {pixels.map((bar, barIndex)=>{
                    return (
                        <div key={barIndex} style={{display:"flex", flexDirection:"column"}}>
                            {bar.map((pixel, pixelIndex) => {
                                return (
                                    <Pixel key={pixelIndex} color={pixel} onClick={(e)=>{
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
