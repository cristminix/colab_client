const fs = require('fs')
const path = require('path')
const Buffer = require('buffer').Buffer;
let btoa,atob;
console.log(__dirname)
const jsonDirectory = path.join(process.cwd(), 'data');

let app_data_json_path = `${jsonDirectory}/app_data.json`;
import app_data from "../data/app_data.json";

function hello(){
	console.log("hello")
}



if (typeof btoa === 'undefined') {
    btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
    atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary');
  };
}
function get_ngrok_url(){
    fs.readFile(app_data_json_path, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
	        var obj = JSON.parse(data); //now
	        return obj.ngrok_url;
    	}
	});
}
function set_ngrok_url(url){
    console.log(`ngrok_url changed:${url}`)
    app_data.ngrok_url = url;
    fs.writeFile (app_data_json_path, JSON.stringify(app_data), function(err) {
        	if (err) {throw err};
        	console.log(`WRITE:${app_data_json_path}`);
        }
    );
}


export {
	hello,btoa,atob,set_ngrok_url,get_ngrok_url
}
