import React, {useState} from 'react';
import {render} from 'react-dom';
import io from 'socket.io-client';


import BrambleLightz from './components/bramblelightz';
import Header from './components/header';


function renderBrambleLightz(frames, updatePixel, updateDuration, addFrame, deleteFrame, send, copy){
    render(<BrambleLightz
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


function getBrambleLightz(){
    const socket = io("/frames");
    socket.on('connect', () =>{
        socket.emit('join', {});
    });
    socket.on('frames', (data) => {
        const {frames} = data;
        renderBrambleLightz(
            frames,
            (cmd) => {
                socket.emit('pixel', cmd);
            },
            (cmd) => {
                socket.emit('duration', cmd);
            },
            (cmd) => {
                socket.emit('add-frame', cmd);
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


document.addEventListener("DOMContentLoaded", function (){
    render(<Header showHelpInitial={sessionStorage.getItem("showHelp") || "true"} />, document.getElementById("header"));
    getBrambleLightz();
});
