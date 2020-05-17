import React from 'react';

import { CustomPicker, ChromePicker } from 'react-color';
import { Hue, Saturation } from 'react-color/lib/components/common';
import { ChromePointer } from 'react-color/lib/components/chrome/ChromePointer';
import { ChromePointerCircle } from 'react-color/lib/components/chrome/ChromePointerCircle';
import { Knob } from "react-rotary-knob";
import * as skins from 'react-rotary-knob-skin-pack';

class _ColorPicker extends React.Component {
    render() {
        const {color, onChange} = this.props;
        return (
            <div style={{display:"flex", flexDirection:"column", flexGrow: 1, margin:10, alignSelf:"stretch"}}>
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

export default function({color, setColor, duration, setDuration, ...props}) {
    return ( 
        <div {...props} style={{padding: 10, flexGrow: 1, display:"flex", flexDirection:"column", alignItems:"center"}}>
            Duration (ms): <Knob min={20} max={1000} step={1} skin={skins.s12} unlockDistance={10} value={duration * 1000} onChange={(value)=>{setDuration(Math.floor(value)/1000);}} />
            <ColorPicker color={color} onChangeComplete={(color)=>{setColor(color.hex);}} onChange={(color)=>{
                setColor(color.hex);
            }}/>
        </div>
    );
}