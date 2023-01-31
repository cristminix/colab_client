import {hello,btoa,atob,get_ngrok_url,set_ngrok_url} from "../../../libs/util.js"
import app_data from "../../../data/app_data.json";


import { NextApiRequest, NextApiResponse } from "next";
// import { useRouter } from 'next/router'
let ngrok_url = app_data.ngrok_url;
let old_ngrok_url = ngrok_url;

export default async (request, response) => {
    const path = request.query.path;
    switch(path){
        case 'setNgrokUrl':

            const new_ngrok_url = atob(request.query.url);
            
            set_ngrok_url(new_ngrok_url);
            ngrok_url = new_ngrok_url;
            console.log(`new ngrok_url detected : ${ngrok_url}`)
            return response.status(200).json({ path: request.query.path, ngrok_url: ngrok_url, old_ngrok_url  });

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
    const url = `${ngrok_url}/${path}?t=${dt}&${qs.join('&')}`;
    const headers= {'ngrok-skip-browser-warning':1}
    const body = await fetch(url,{headers}).then(e=>{return e.json()})
    console.log(`GET:${url}`)
    return response.status(200).json(body);

  // }catch(e){
    // console.log(e);
  // }  
};