import React, {useState} from 'react';
import {render} from 'react-dom';
import io from 'socket.io-client';

import { CustomPicker, ChromePicker } from 'react-color';
import { Hue, Saturation } from 'react-color/lib/components/common';
import { ChromePointer } from 'react-color/lib/components/chrome/ChromePointer';
import { ChromePointerCircle } from 'react-color/lib/components/chrome/ChromePointerCircle';


class _ColorPicker extends React.Component {
    render() {
        const {color, onChange} = this.props;
        return (
            <div style={{display:"flex", flexDirection:"column", flexGrow: 1, margin:10}}>
                <div style={{flexGrow: 1, backgroundColor: color}} />
                <div style={{position:"relative", flexGrow: 3}} >
                    <Saturation
                        {...this.props}
                        pointer={ChromePointerCircle}
                    />
                </div>
                <div style={{position:"relative", height:10}} >
                    <Hue
                        {...this.props}
                        pointer={ChromePointer}
                    />
                </div>
            </div>
        );
    }
}

const ColorPicker = CustomPicker(_ColorPicker);

const Controls = ({color, setColor, ...props}) => {
    return (
        <div {...props} >
            <ColorPicker color={color} onChangeComplete={(color)=>{setColor(color.hex);}} onChange={(color)=>{
                setColor(color.hex);
            }}/>
        </div>
    );
}


const Pixel = ({color, paint, painting}) => {
    return (
        <div className="pixel" style={{
            backgroundColor: color,
            flexGrow: 1,
            margin: 1
        }} onMouseDown={paint} 

        onMouseEnter={(e)=>{
            if (painting) {
                paint(e);
            }
        }} />
    );
}


const Frame = ({pixels, duration, color, setColor, updatePixel, updateDuration, painting, active, ...props}) => {
    return (
        <div {...props}
            style={{
                border: active ? "yellow 3px solid" : "white 1px solid",
                borderRadius: 5,
                minWidth: 100,
                margin:10,
                display:"flex",
                flexDirection:"row",
                alignSelf:"stretch",
                flexGrow: 1}}>
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

const Drawing = ({pixels, duration, updateDuration, updatePixel}) => {
    const [color, setColor] = useState("#FF0000");
    const [painting, setPainting] = useState(false);

    return (
        <div style={{display: "flex", flexGrow: 5, alignSelf:"stretch"}} >
            <Controls color={color} setColor={setColor} style={{flexGrow: 1, display:"flex", flexDirection:"column"}}/>
            <div style={{display: "flex", flexGrow: 8, alignSelf:"stretch"}}
                onMouseUp={(e)=>{setPainting(false);}}
                onMouseDown={(e)=>{setPainting(true);}}>
                <Frame pixels={pixels} setColor={setColor} color={color} painting={painting} updatePixel={updatePixel} />
            </div>
        </div>
    );

};


const Session = ({frames, updatePixel, updateDuration, send, copy}) => {
    const [frame, setFrame] = useState(0);
    const maxFrame = frames.length - 1;

    return (
        <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", width:"100%", height:"100%"}}>
            <div style={{margin:20, display:"flex", alignSelf: "stretch", flexGrow: 1, overflowX:"scroll"}}>
                {frames.map(({pixels, duration}, i) => <Frame key={i} pixels={pixels} duration={duration} onClick={(e)=>{
                    if (e.shiftKey) {
                        copy(frame, i);
                    } else {
                        setFrame(i);
                    }
                }} active={frame === i} updateDuration={updateDuration} />)}
            </div>
            <Drawing pixels={frames[frame].pixels} duration={frames[frame].duration} updateDuration={updateDuration} updatePixel={({...parts}) => {
                updatePixel({...parts, frame_index: frame});}} />
            <button onClick={send}>send</button>
        </div>
    );
};


function renderSession(frames, updatePixel, updateDuration, send, copy){
    render(<Session frames={frames} updatePixel={updatePixel} updateDuration={updateDuration}
                    send={send} copy={copy} />, document.getElementById("content"));
}


function getSession(){
    const socket = io("/frames");
    socket.on('connect', () =>{
        socket.emit('join', {});
    });
    socket.on('frames', (data) => {
        const {frames} = data;
        renderSession(
            frames,
            (cmd) => {
                socket.emit('pixel', cmd);
            },
            (cmd) => {
                socket.emit('duration', cmd);
            },
            () => {
                socket.emit('send', "");
            },
            (a, b)=> {
                socket.emit('copy', {
                   frame_index_a: a,
                   frame_index_b: b 
                });
            });
    });
    document.getElementById("content").innerHTML = "Loading...";
}



document.addEventListener("DOMContentLoaded", function (){
    getSession();
    // renderSession({frames: [
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
