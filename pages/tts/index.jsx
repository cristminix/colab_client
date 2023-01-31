import React, { useState } from "react"
import Script from 'next/script'
import app_data from "../../data/app_data.json"
export default class Tts extends React.Component {
  state={
         value:'halo nama saya budi',
         show:'',
         output:'...server output',
         socketId: ''
      }

handleChange=(e)=>{
  this.setState({value:e.target.value})
}

submit=()=>{
  const url = `/api/proxy/tts?text=${encodeURI(this.state.value)}&socketId=${this.state.socketId}`
   this.setState({show:url})
  //  console.log(this.state.show)
  fetch(url).then(r=> {return r.json()}).then(json=>{
    console.log(json);
    this.setState({output:JSON.stringify(json)})
  }) 
}
  
    
setSocketId = (socketId)=>{
  console.log(socketId);
  this.setState({socketId})
}

initSocket = ()=>{
  const self= this;
  const socket_io = io(`${app_data.ngrok_url}/test`, {
    extraHeaders: {
      'ngrok-skip-browser-warning':1
    },
    reconnect:true
  });

  socket_io.on('connect', function (socket) {
    console.log('Connected!');
    console.log(this.id)
    self.setSocketId(this.id)
  });
  socket_io.on("report",(a,b,c)=>{
    console.log("REPORT")
    console.log(a,b,c)
  })
  socket_io.emit('reply', 'test msg');
}
  
  render(){
    return (
        <>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.4/socket.io.js" onLoad={() => {
          this.initSocket()
        }} />

        <h1 className="text-3xl font-bold">
          Colab TTS Client!
        </h1>
        <div className={"mb-6"}>
          <div className={"flex flex-col mb-4"}>
          <label className={"b-2 uppercase font-bold text-lg text-grey-darkest"} htmlFor="textInput">
            Masukkan Text : 

          </label>

            <textarea id="textInput" type="text" className={"border py-2 px-3 text-grey-darkest"}  value={this.state.value} onChange={this.handleChange}></textarea>
        </div>
          <button onClick={this.submit} className={"block bg-green-800  hover:bg-green-900  uppercase text-lg mx-auto p-4 rounded"} type="submit">TTS</button>

        </div>
        <pre>{this.state.show}</pre>
            <textarea id="textOutput" className={"border py-2 px-3 text-grey-darkest"}  value={this.state.output} readOnly></textarea>

        </>
      )
  }
  
}