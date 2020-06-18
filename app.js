
const request = require('request');
const fs = require('fs');

// Intalled node modules: 
const cmd = require('node-cmd');
const TelegramBot = require('node-telegram-bot-api');

const token = 'Your token'; // Your token from BotFather;
let bot = new TelegramBot(token, {polling: {params:{timeout: 2000, interval: 0 },},});

const witaikey = 'Your api key'; // Your api key from wit.ai

// opesdec must be installed on your system (Ubuntu command for installation: apt install opus-tools)


bot.on('message', (msg)=>{

  // On  voice message
  if (msg.voice) {

    // Sending 'typing' notification
    Mes.bot.sendChatAction(Mes.msg.chat.id, 'typing');

    input({msg: msg, bot: bot}, {}, (text)=>{

      bot.sendMessage(msg.from.id, text);

    });

  } else {
    bot.sendMessage(msg.from.id, 'Send me voice message');
  }

});


function input (Mes, data, callback) {

  let file_id = Mes.msg.voice.file_id;

  let started = Date.now();
  let trace = ``;

  // Getting file link
  Mes.bot.getFileLink (file_id)
  .then((link)=>{
    trace+='getFileLink '+ Math.round((Date.now()-started)/10)/100 + '\n';

    // Downloading file
    request.get({url: link, encoding:null}, (error, response, body)=>{
    trace+='request.get '+ Math.round((Date.now()-started)/10)/100 + '\n';

      // Saving file
      fs.writeFile('/home/temp/voice.ogg', body, (err) => {
      trace+='writefile '+ Math.round((Date.now()-started)/10)/100 + '\n';

        if (err) throw err;


        // Converting file with opusdec app using commandline
        // opesdec must be installed on your system (ubuntu command for installation: apt install opus-tools)
        
        let command = `opusdec --rate 16000 /home/temp/voice.ogg /home/temp/voice.wav;
          `;

        cmd.get(command, function(err, data, stderr){

          trace+='opusdec '+ Math.round((Date.now()-started)/10)/100 + '\n';

          // Reading converted file
          fs.readFile("/home/temp/voice.wav", function (err, data) {
          trace+='fs.readFile '+ Math.round((Date.now()-started)/10)/100 + '\n';

            // Deleting files
            fs.unlink(`/home/temp/voice.wav`);
            fs.unlink(`/home/temp/voice.ogg`);

            if (err) {throw err;}
        
            // Using wit.ai API to recognize speach
            witaiApi(data, (text)=>{
              trace+='witaiApi '+ Math.round((Date.now()-started)/10)/100 + '\n\n';

              // If testing - sending trace info and text
              if (data.test) {
                sender.Menu({
                  Mes: Mes,
                  text: trace+text,
                });
              }
          
              if (callback) {callback(text);}

            });
          });

        });

      });

    });
  });
}


function witaiApi (body, callback) {

  const uri = `https://api.wit.ai/speech`;
  const key = witaikey; // Your api key from wit.ai

  // отправляем post запрос с буфером аудио
  request.post({
    uri,
    headers: {
      'Accept': 'audio/wav',
      'Authorization': `Bearer ` + key,
      'Content-Type': 'audio/wav',
      'Transfer-Encoding': 'chunked'
    },
    body
  }, (err, resp)=>{

    let text;
    try {
      text = (JSON.parse(resp.body || '{}')||{}).text || JSON.stringify(err);
    }
    catch (e) {}

    callback (text);
  });
}

module.exports.input =  input;