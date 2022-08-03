const express = require('express');

const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK('bdae7e78dd4f7278dae8', '2340832e94814c9edaf889523b0af625583b118bee4f942bf306a0fb447fdc60');
const fs = require('fs');
const app = express();
const PORT = 3001
var axios = require('axios');
//install axios

const path = require("path");


app.use(express.static('public'));

async function createJsonFile(jsonName,color,value,description,hash,name){
 // metadata for the Opensea

    openSeaMetaData = {
    "description": description, 
    "external_url": "https://openseacreatures.io/3", 
    "image": "https://gateway.pinata.cloud/ipfs/"+hash, 
    "name": name,
    "attributes": [ 
         {
            "color": color,
            "value": value
        }
    ], 
  };
json = {
    
        "attributes": [
        {
        "color": color,
        "value": value
        }
        ],
        "description": description,
        "image": "https://gateway.pinata.cloud/ipfs/"+hash,
        "name": name
        
}
openSeaMetaData = JSON.stringify(openSeaMetaData);
let jsonFilePath = __dirname + '/uploads/jsons/'+jsonName+'.json';
return new Promise((myResolve, myReject) => {
 fs.writeFile(jsonFilePath, openSeaMetaData, (err) => {
    if (!err) {
        console.log('done');
        myResolve(jsonFilePath);
    }else{
       console.log(err);
       myReject(err);
    }

});
});
}

function uploadPinata(fileName,filePath){
    return new Promise((myResolve, myReject) => {
    const readableStreamForFile = fs.createReadStream(filePath);
    const options = {
        pinataMetadata: {
            name:fileName,
            keyvalues: {
                customKey: 'customValue',
                customKey2: 'customValue2'
            }
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    
   pinata.pinFileToIPFS(readableStreamForFile, options).then((result)=>{
           myResolve(result);
   }).catch((err) => {
    //handle error here
    console.log(err);
    myReject(err);
});;
});
}

app.post('/upload', upload.any('photo'), async (req, res) => {
    var id = 1;
    if(req.files) {
        
        // await Promise.all(req.files.map(async (file) => {
        for await( const file of req.files){
        let fileName = id+ path.extname(file.originalname);
            let uploadPng = await uploadPinata(fileName,file.path);
      let jsonFilePath = await  createJsonFile(id,'Blue','abc','This is a nice picture.',uploadPng.IpfsHash,'painting');
            let fileNameJson = id+'.json';
            let uploadJson = await uploadPinata(fileNameJson,jsonFilePath);
            id++;
    }
        
    }
    else throw 'error';

    
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});