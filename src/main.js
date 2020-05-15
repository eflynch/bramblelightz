import React, {useState} from 'react';
import {render} from 'react-dom';
import io from 'socket.io-client';

import { CustomPicker, ChromePicker } from 'react-color';
import { Hue, Saturation } from 'react-color/lib/components/common';
import { ChromePointer } from 'react-color/lib/components/chrome/ChromePointer';
import { ChromePointerCircle } from 'react-color/lib/components/chrome/ChromePointerCircle';
import InputNumber from 'react-input-number';


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

const Controls = ({color, setColor, duration, setDuration, ...props}) => {
    return (
        <div {...props} >
            Duration: <InputNumber min={0.033} max={10} step={0.01} value={duration} onChange={setDuration} />
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


const Frame = ({pixels, duration, color, setColor, updatePixel, painting, active, ...props}) => {
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

const Drawing = ({pixels, duration, updateDuration, updatePixel}) => {
    const [color, setColor] = useState("#FF0000");
    const [painting, setPainting] = useState(false);

    return (
        <div style={{display: "flex", flexGrow: 5, alignSelf:"stretch"}} >
            <Controls duration={duration} setDuration={updateDuration} color={color} setColor={setColor} style={{padding: 10, flexGrow: 1, display:"flex", flexDirection:"column"}}/>
            <div style={{display: "flex", flexGrow: 8, alignSelf:"stretch"}}
                onMouseUp={(e)=>{setPainting(false);}}
                onMouseDown={(e)=>{setPainting(true);}}>
                <Frame pixels={pixels} setColor={setColor} color={color} painting={painting} updatePixel={updatePixel} />
            </div>
        </div>
    );

};


const Session = ({frames, updatePixel, updateDuration, addFrame, deleteFrame, send, copy}) => {
    const [frame, setFrame] = useState(0);
    const maxFrame = frames.length - 1;

    return (
        <div style={{userSelect:"none", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", width:"100%", height:"calc(100vh - 60px)"}}>
            <div style={{margin:20, display:"flex", alignSelf: "stretch", flexGrow: 1, overflowX:"scroll"}}>
                {frames.map(({pixels, duration}, i) => <Frame key={i} pixels={pixels} duration={duration} onClick={(e)=>{
                    if (e.shiftKey) {
                        copy(frame, i);
                    } else if (e.metaKey) {
                        if (frame > maxFrame - 1) {
                            setFrame(maxFrame - 1);
                        }
                        deleteFrame({frame_index:frame});
                    } else {
                        setFrame(i);
                    }
                }} active={frame === i} />)}
                <div
                    onClick={()=>{
                        addFrame();
                    }}
                    style={{
                        display:"flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "white 1px solid",
                        opacity: 0.5,
                        borderRadius: 5,
                        minWidth: 100,
                        margin:10,
                        alignSelf:"stretch",
                        flexGrow: 1
                    }}>+</div>
            </div>
            <Drawing pixels={frames[frame].pixels} duration={frames[frame].duration} updateDuration={(duration)=>{
                updateDuration({frame_index: frame, duration: duration});
            }} updatePixel={({...parts}) => {
                updatePixel({...parts, frame_index: frame});}} />
            <div style={{display:"flex"}}>
                <button onClick={send}>send</button>
                <button onClick={()=> {
                    let doIt = (i) => {
                        setTimeout(()=>{
                            if (i > maxFrame) {
                                return;
                            }
                            setFrame(i);
                            doIt(i+1);
                        }, frames[i].duration * 1000);
                    };
                    doIt(0);
                }}>play</button>
            </div>
        </div>
    );
};


function renderSession(frames, updatePixel, updateDuration, addFrame, deleteFrame, send, copy){
    render(<Session
                frames={frames}
                updatePixel={updatePixel}
                updateDuration={updateDuration}
                addFrame={addFrame}
                deleteFrame={deleteFrame}
                send={send}
                copy={copy} />,
            document.getElementById("content")
    );
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
                socket.emit('add-frame', "");
            },
            (cmd) => {
                socket.emit('delete-frame', cmd);
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


const Help = ({close}) => {
    return (
        <div style={{
            position:"fixed", width:"80%", height:"80%", maxWidth:600, right: 30, top:"10%", zIndex:1,
            backgroundColor:"black", border:"white 2px solid", borderRadius:5,
            padding: 20,
            display: "flex", justifyContent:"space-between", alignItems:"center", flexDirection:"column"
        }}>
            <p>
                Welcome to BrambleLightz, the place where the bramble lightz are.
            </p>
            <div style={{maxWidth: 450}}>
                <p>
                    Here you can collaborate on what beautiful light display should grace our living room.
                    Each page will be a frame of an animation. You can change the pixels of each frame as well
                    as change the duration that frame should for. You can also add more frames or delete existing
                    frames.
                </p>
                <p>
                    Some Hot tips for sick UX that has no affordance!
                    <ul>
                        <li>Shift+click a frame at the top to copy the current frame to that frame</li>
                        <li>Click the plus button at the end of the frames to add another frame</li>
                        <li>Meta+click a frame at the top to delete it</li>
                        <li>Shift+click a pixel to snag it's color for your paint brush!</li>
                        <li>Hit "send" to send light up the board</li>
                        <li>Hit "play" to show the animation here on the internet</li>
                    </ul>
                </p>
            </div>
            <p>
                Love, efl
            </p>
            <button onClick={close}>close</button>
        </div>
    );
};


const Header = (props) => {
    const [showHelp, setShowHelp] = useState(false);
    return (
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", height: "100%"}}>
            <span>BrambleLightz</span>
            <button onClick={()=>{setShowHelp(true);}}>?</button>
            {showHelp ? <Help close={()=>{setShowHelp(false);}}/> : undefined}
        </div>
    );
}


document.addEventListener("DOMContentLoaded", function (){
    render(<Header />, document.getElementById("header"));
    getSession();
});
