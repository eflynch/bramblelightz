import React from 'react';

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

export default function({color, setColor, duration, setDuration, ...props}) {
    return (
        <div {...props} >
            Duration: <InputNumber min={0.033} max={10} step={0.01} value={duration} onChange={setDuration} />
            <ColorPicker color={color} onChangeComplete={(color)=>{setColor(color.hex);}} onChange={(color)=>{
                setColor(color.hex);
            }}/>
        </div>
    );
}