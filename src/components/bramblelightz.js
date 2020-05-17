import React, { useState } from 'react';

import Drawing from './drawing';
import Frame from './frame';

export default function({frames, updatePixel, updateDuration, addFrame, deleteFrame, send, copy}) {
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
                <button title="send it to the lights at Brambleberry" onClick={send}>send to lightz</button>
                <button title="play it here in the browser" onClick={()=> {
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
                }}>play it here</button>
            </div>
        </div>
    );
};