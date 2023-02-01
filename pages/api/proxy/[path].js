import {hello,btoa,atob,get_ngrok_url,set_ngrok_url} from "../../../libs/util.js"
import app_data from "../../../data/app_data.json";

const R = require('request');
let ngrok_url = app_data.ngrok_url;
let old_ngrok_url = ngrok_url;
let url;
export default async (request, response) => {
    const path = request.query.path;
    switch(path){
        case 'setNgrokUrl':

            let str = atob(request.query.url);
            const match = str.split(' ').join("\n").match(/(http[s]?:\/\/.*\.ngrok\.io)/g)
            if(match.length == 0){
              return;
            }
            let new_ngrok_url = match[0];
            console.log(new_ngrok_url)
            set_ngrok_url(new_ngrok_url);
            ngrok_url = new_ngrok_url;
            console.log(`new ngrok_url detected : ${ngrok_url}`)
            if (response.socket.server.io) {
              const message = 'Socket is already running'
              response.socket.server.io.emit('command','set_ngrok_url',ngrok_url);
              console.log(message)
          
            }
            return response.status(200).json({ path: request.query.path, ngrok_url: ngrok_url, old_ngrok_url  });

        break;
        case 'play':
          url = atob(request.query.url);
          return R(url).pipe(response);
        break;
        case 'p':
          if(typeof request.query.url != 'undefined'){
            url = request.query.url;
            url = `${ngrok_url}/p/${url}`;

            return R(url).pipe(response);
          }
          
        break;
    }    

  // do nothing fancy and simply return a string concatenation
  // try{
    let qs = [];
    for( let q in  request.query){
        // console.log(q);
        if(q != 'path'){
            qs.push(`${q}=${request.query[q]}`);
        }
    }
    const dt = btoa((new Date).getTime().toString()).replace(/\=/g,'').toLowerCase();
    url = `${ngrok_url}/${path}?t=${dt}&${qs.join('&')}`;
    // const headers= {'ngrok-skip-browser-warning':1}
    // const body = await fetch(url,{headers}).then(e=>{return e.json()})
    // const url = atob(request.query.url);
    // console.log(request)
    console.log(`GET:${url}`)

    return R(url).pipe(response);
     
};