import {hello,btoa,atob,get_ngrok_url,set_ngrok_url} from "../../../libs/util.js"
hello()

import { NextApiRequest, NextApiResponse } from "next";
// import { useRouter } from 'next/router'

export default async (request, response) => {
    const path = request.query.path;
    switch(path){
        case 'setNgrokUrl':
            const old_ngrok_url = get_ngrok_url();

            const ngrok_url = atob(request.query.url);
            
            set_ngrok_url(ngrok_url);

            console.log(`new ngrok_url detected : ${ngrok_url}`)
            return response.status(200).json({ path: request.query.path, ngrok_url: ngrok_url, old_ngrok_url  });

        break;
    }    
  const {
    query: { url, text },
    method,
  } = request;
  console.log(url, text, method);

  // do nothing fancy and simply return a string concatenation
  return response.status(200).json({ path: request.query.path, query: url  });
};