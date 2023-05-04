import { Component,useState,useRef,createRef } from "react"
import Script from 'next/script'

import app_data from "../../data/app_data.json"
export default class Tts extends Component {
  constructor(props) {
    super(props);
    this.audioRef = createRef();
    
  }
  state={
       value:'',
       show:'',
       output:'...server output',
       socketId: '',
       ttsLoading: false,
       audioOutput:'',
       progress:0, 
  }
  
  pTimeout = 0;
  componentDidMount(){
    const value = localStorage['value'] || 'halo';
    const audioOutput = localStorage['audioOutput'] || 'halo';
    this.setState({value,audioOutput},()=>{
      // this.audioRef.current.pause();
      this.audioRef.current.load();
      // this.audioRef.current.play();
    })
  }
  handleChange=(e)=>{
    this.setState({value:e.target.value})
  }

  startPtimeout(){
    this.pTimeout = setInterval(()=>{
      const progress = this.state.progress+1;
      // console.log(progress)
      this.setState({progress})
    },1000)
  }
  stopPtimeout(){
    clearInterval(this.pTimeout)
  }
  
  submit = async ()=>{

  // return;
  this.setState({progress:0});
  this.startPtimeout();
  const fetchData = async ()=>{
    this.setState({ttsLoading:true});
    const url = `/api/proxy/tts?text=${encodeURI(this.state.value)}&socketId=${app_data.socket_id}`
    const json = await fetch(url)
    
  }
  await fetchData();
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
  const MySocket = {
    socket: null,
    init(){
      MySocket.socket = io(`${app_data.ngrok_url}`, {
        reconnection: false,
        extraHeaders: {
          'ngrok-skip-browser-warning':1
        }
      });
      MySocket.socket.on('connect', function () {
        console.log(`Socket connected ${app_data.ngrok_url} `);
        // app_data.socket_id = this.id;
        MySocket.onConnect();
      });

      MySocket.socket.on('disconnect', function () {
        MySocket.socket.close();
        console.log(`Socket disconnected ${app_data.ngrok_url} `);
        MySocket.onDisconnect();
      });
    },
    onReconnect(){
      setTimeout(()=>{
        console.log(`Socket try to reconnect in 1 s ${app_data.ngrok_url} `);
        MySocket.init();
      },1000);
    },
    onDisconnect(){
      MySocket.socket.off('disconnect');
      MySocket.socket.off('connect');
      MySocket.socket.off('report');
      MySocket.onReconnect();
    },
    onConnect(){
      MySocket.socket.on("report",(path,message,socket_id)=>{
        MySocket.onReport(path,message,socket_id);
      })
    },
    onReport(path,message,socket_id){
      console.log(`path:${path}`)
      console.log(`message:${message}`)
      console.log(`socket_id:${socket_id}`)
      console.log(`current socket_id:${app_data.socket_id}`)
  
      if(path == 'tts'){
        const output_url = `${app_data.ngrok_url}${message}`;
        console.log(`${path} complete with output url ${output_url}`);
        const proxy_url = `http://localhost:3000/api/proxy/play?url=${btoa(output_url)}`;
        self.setState({ttsLoading:false,audioOutput:proxy_url});
        self.stopPtimeout();
        self.onTrackChange(proxy_url);
        localStorage['value'] = self.state.value;
        localStorage['audioOutput'] = proxy_url;
      }
    }
  }

  MySocket.init();
}
onTrackChange(source) {
  

  this.setState({ audioOutput: source },function(){
    this.audioRef.current.pause();
    this.audioRef.current.load();
    this.audioRef.current.play();
  })
}
  render(){
    let stateProcess = "";

    if(this.state.progress == 0){
      stateProcess = ""
    }else{
      stateProcess = `(${this.state.progress})`
    }

    return (
        <>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.4/socket.io.js" onLoad={() => {
          this.initSocket();
          this.initSocketLocal();
        }} />
          <div class="flex flex-col w-full">
          <div class="flex-grow">Header</div>
          <div class="flex flex-row">
          <div class="text-center w-1/5">Left Sidebar</div>
          <div class="text-center w-3/5">Content</div>
          <div class="text-center w-1/5">Right Sidebar</div>
          </div>
          <div class="flex-grow">Footer</div>
          </div>
        <div className="grid grid-cols-2 gap-4 p-2">
          <div className="a">
          <h1 className="text-3xl font-bold select-all ">Colab TTS Client</h1>  
          </div>
          <div className="b  row-span-2 flex flex-col">
          <pre>{this.state.show}</pre>
            <textarea id="textOutput"  className={"w-100 form-input border"}  value={this.state.output} readOnly></textarea>
  
          </div>
          <div className="c">
            <div className="flex flex-col mb-4">
              <label className={"form-label"} htmlFor="textInput">Please enter text to convert to voice: </label>
              <textarea id="textInput" type="text" className={"bg-yellow-100 border rounded-md h-64 p-2 resize-none"}  value={this.state.value} onChange={this.handleChange}></textarea>
            </div>  
            <div className="grid grid-cols-2 gap-2">
              <div className={"w-4/5 h-10 overflow-hidden"}>
                <audio controls ref={this.audioRef} className="-mt-2 -ml-3">
                  <source src={this.state.audioOutput} />
                </audio>
              </div>
              <div className={"text-right"}>
                <button disabled={this.state.ttsLoading} onClick={this.submit} className={"text-white bg-blue-600 hover:bg-blue-800 p-2 rounded-lg"}><i className="fas fa-microchip"></i> Process <span>{stateProcess}</span></button>
                
                
              </div>  
              </div>
          </div>
          
          <div className="d">
          <div className="alert alert-warning">
              server log
            </div>
          </div>
        </div>
        
        
        
        </>
      )
  }
  
}