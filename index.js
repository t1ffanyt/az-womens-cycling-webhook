const express = require("express");
const parser = require("body-parser");
const axios = require("axios");
require("dotenv").config()

const app = express().use(parser.json());


app.listen(8000,()=>{
    console.log("webhook is listening");
});

app.get("/webhook",(request, response) =>{
    let mode = request.query["hub.mode"];
    let challenge = request.query["hub.challenge"];
    let token = request.query["hub.verify_token"];
    const reqToken = process.env.TOKEN

    if(mode && token){
        if(mode == "subscribe" && token == reqToken ){
            response.status(200).send(challenge);
        }else{
            response.status(400);
        }
    }


});

app.post("/webhook",(req,res)=>{ 

    let body_param=req.body;

    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
        console.log("inside body param");
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]  
            ){
               let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
               let from = body_param.entry[0].changes[0].value.messages[0].from; 
               let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

               console.log("phone number "+phon_no_id);
               console.log("from "+from);
               console.log("boady param "+msg_body);

               axios({
                   method:"POST",
                   url:"https://graph.facebook.com/v13.0/"+phon_no_id+"/messages?access_token="+token,
                   data:{
                       messaging_product:"whatsapp",
                       to:from,
                       text:{
                           body:"Hi.. I'm Prasath, your message is "+msg_body
                       }
                   },
                   headers:{
                       "Content-Type":"application/json"
                   }

               });

               res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }

    }

});