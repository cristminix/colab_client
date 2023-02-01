import React, { useState,useRef,createRef } from "react"
import Script from 'next/script'

import app_data from "../../data/app_data.json"
export default class Tts extends React.Component {
  constructor(props) {
    super(props);
    this.audioRef = React.createRef();
  }
  state={
         value:'mengerti',
         show:'',
         output:'...server output',
         socketId: '',
         ttsLoading: false,
         audioOutput:''
      }

handleChange=(e)=>{
  this.setState({value:e.target.value})
}

submit=()=>{
  this.setState({ttsLoading:true});
  const url = `/api/proxy/tts?text=${encodeURI(this.state.value)}&socketId=${app_data.socket_id}`
   this.setState({show:url})
  //  console.log(this.state.show)
  fetch(url).then(r=> {return r.json()}).then(json=>{
    console.log(json);
    // this.setState({output:JSON.stringify(json)})
  }) 
}
  
    
setSocketId = (socketId)=>{
  console.log(socketId);
  this.setState({socketId})
}
initSocketLocal(){
  const self = this;
  console.log(`Invoke socket server`);
  const socketEndPoint = '/api/socket';
  fetch(socketEndPoint)
  .then((r)=>{return r.json()}).then((r)=>{
    console.log(r);
  });
  const localUrl = 'ws://localhost:3000/';
  const socket = io(localUrl,{reconnect:true});
  socket.on('connect',()=>{
    console.log(`Socket connected to ${localUrl}`)
  });
  socket.on('info',(message)=>{
    console.log(`Ws.Local.info:${message}`);
  });
  socket.on('warn',(message)=>{
    console.log(`Ws.Local.warn:${message}`);
  });
  socket.on('error',(message)=>{
    console.log(`Ws.Local.error:${message}`);
  });
  socket.on('command',(cmd,param)=>{
    console.log(`Ws.Local.command:${cmd} ${param}`);
    if(cmd=='set_ngrok_url'){
      app_data.ngrok_url = param;
      self.initSocket();
    }
  });
}
initSocket = ()=>{
  const self= this;
  const socket_io = io(`${app_data.ngrok_url}`, {
    extraHeaders: {
      'ngrok-skip-browser-warning':1
    },
    reconnect:true
  });

  socket_io.on('connect', function () {
    console.log(`Socket connected ${app_data.ngrok_url} `);
    // console.log(this.id)
    // self.setSocketId(this.id)
    app_data.socket_id = this.id;
  });
  socket_io.on("report",(path,message,socket_id)=>{
    console.log(`path:${path}`)
    console.log(`message:${message}`)
    console.log(`socket_id:${socket_id}`)
    console.log(`current socket_id:${app_data.socket_id}`)

    if(socket_id == app_data.socket_id){
      if(path == 'tts'){
        const output_url = `${app_data.ngrok_url}${message}`;
        console.log(`${path} complete with output url ${output_url}`);
        const proxy_url = `http://localhost:3000/api/proxy/play?url=${btoa(output_url)}`;
        this.setState({ttsLoading:false,audioOutput:proxy_url});
        self.onTrackChange(output_url);

      }
    }
    // console.log(a,b,c)
  })
  // socket_io.emit('reply', 'test msg');
}
onTrackChange(source) {
  

  this.setState({ audioOutput: source },function(){
    this.audioRef.current.pause();
    this.audioRef.current.load();
    this.audioRef.current.play();
  })
}
  render(){


    return (
        <>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.4/socket.io.js" onLoad={() => {
          this.initSocket();
          this.initSocketLocal();
        }} />

        <div className="container">
          <div className="row">
            <div className="col-lg-6">
            <h1 className="text-3xl font-bold">Colab TTS Client</h1>
            <div className={"mb-6"}>
              <div className={"flex flex-col mb-4"}>
                <label className={"form-label"} htmlFor="textInput">Please enter text to convert to voice: </label>
                <textarea id="textInput" type="text" className={"form-input border"}  value={this.state.value} onChange={this.handleChange}></textarea>
              </div>
              <button disabled={this.state.ttsLoading} onClick={this.submit} className={"btn btn-primary"}><i className="fas fa-microchip"></i> Process</button>
            </div>
            <div className={"mb-6"}>
            <audio controls ref={this.audioRef}>
              <source src={this.state.audioOutput} />
            </audio>
            </div>
            </div>
            <div className="col col-lg-6">
            <div className="alert alert-warning">
              server log
            </div>
            <pre>{this.state.show}</pre>
            <textarea id="textOutput"  className={"w-100 form-input border"}  value={this.state.output} readOnly></textarea>

            </div>
          </div>
        </div>
        
        
        </>
      )
  }
  
}