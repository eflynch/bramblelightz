import React, { useState, useEffect } from 'react';

const Help = ({close}) => {
    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", zIndex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.6)"
        }} onClick={close}>
            <div style={{
                backgroundColor:"black", border:"white 2px solid", borderRadius:5,
                padding: 20,
                display: "flex", justifyContent:"space-between", alignItems:"center", flexDirection:"column"
            }} onClick={(e)=>{e.stopPropagation();}}>
                <h2 style={{maxWidth:450}} >
                    Welcome to <i>BrambleLightz</i>
                    </h2>
                <span style={{fontSize:"small"}}>...the place where the bramble lightz are.</span>
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
                            <li>Cmd(Ctrl)+click a frame at the top to delete it</li>
                            <li>Shift+click a pixel to snag it's color for your paint brush!</li>
                            <li>Hit "send" to light up the board</li>
                            <li>Hit "play" to show the animation here on the internet</li>
                        </ul>
                    </p>
                </div>
                <p>
                    Love, efl
                </p>
                <button onClick={close}>close</button>
            </div>
        </div>
    );
};


export default function({showHelpInitial}) {
    const [showHelp, setShowHelp] = useState(showHelpInitial === "true");

    useEffect(() => {
        window.sessionStorage.setItem("showHelp", showHelp);
    });
    return (
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", height: "100%"}}>
            <span>BrambleLightz</span>
            <div style={{display:"flex"}}>
                <button title="help" onClick={()=>{setShowHelp(!showHelp);}}>?</button>
                <form action="https://www.paypal.me/boardzorg">
                    <button type="submit" title="donate">❤</button>
                </form>
            </div>
            {showHelp ? <Help close={()=>{setShowHelp(false);}}/> : undefined}
        </div>
    );
}
