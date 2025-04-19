const AWS = require("aws-sdk");
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
// const fs = require('fs');
const path = require('path');
require('dotenv').config(); // 確保第一行載入

// const AUDIO_DIR = path.join(__dirname, 'audio');

// if (!fs.existsSync(AUDIO_DIR)) {
//   fs.mkdirSync(AUDIO_DIR, { recursive: true });
// }

// 設定 AWS Lex
AWS.config.update({
    region: "us-east-1", // 替換成你的 Lex 所在區域
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
});

const lexRuntime = new AWS.LexRuntimeV2({
  endpoint: 'runtime-v2-lex.us-east-1.amazonaws.com'
});

const lexBotAliasMap = {
    "test_tenant": "0CJNLTBJN9",
    "macutea": "JWSFM8QASG"
};

async function chatWithBot(message, sessionId, hostname) {
    const params = {
        botId: "R7VF9S9KTZ",
        botAliasId: lexBotAliasMap[hostname],
        localeId: "en_US",
        sessionId: sessionId,
        text: message
    };

    try {
        const response = await lexRuntime.recognizeText(params).promise();

        // 處理多則訊息
        // if (response.messages && response.messages.length > 0) {
        //     // 將所有訊息串接成單一字串
        //     const combinedMessages = response.messages
        //         .map(msg => msg.content)
        //         .join("\n");
            
        //     return combinedMessages;
        // } else {
        //     return "No response from bot";
        // }
        return response.messages;
    } catch (error) {
        // 僅寫入 log，不拋出錯誤
        console.error("Lex API Error:", error);

        // 回傳一個友善的訊息或空值
        return "The chatbot is currently unavailable. Please try again later.";
    }
}


async function sendMessageToLex(req, res) {
    const hostname = req.hostname.split('.')[0];
    console.log("user from ", hostname, "send to lex:");
    const { message, sessionId } = req.body;
    console.log(message);

    try {
        const response = await chatWithBot(message, sessionId, hostname);
        console.log(JSON.stringify(response, null, 2));
        res.json({
            response,
            sessionId: sessionId
        });
    } catch (error) {
        res.status(500).json({ error: "Lex API Error" });
    }
}

async function sendVoiceToLex(req, res) {
  console.log("sendVoiceToLex");
  const hostname = req.hostname.split('.')[0];

  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }

  console.log('file mimetype:', req.file.mimetype);

  if (req.file.mimetype !== 'audio/webm') {
    return res.status(400).send('Invalid audio format. Please upload a WebM file.');
  }

  const sessionId = req.body.sessionId;

  const pcmBuffer = await convertWebmToPcm(req.file.buffer);
  const params = {
    botId: "R7VF9S9KTZ",
    botAliasId: lexBotAliasMap[hostname],
    localeId: "en_US",
    sessionId: sessionId,
    requestContentType: 'audio/l16; rate=16000; channels=1',
    responseContentType: 'audio/mpeg',
    inputStream: pcmBuffer
  };

  lexRuntime.recognizeUtterance(params, (err, data) => {
    if (err) {
      console.error("Error from Lex:", err);
      return res.status(500).send('Error processing voice input');
    }

    // In AWS SDK v2, data.audioStream is already a Buffer
    const audioBuffer = data.audioStream;

    // // generate a filename
    // const filename = `lex-response-${Date.now()}.mp3`;
    // const filepath = path.join(AUDIO_DIR, filename);

    // // write the file locally
    // fs.writeFile(filepath, audioBuffer, writeErr => {
    //   if (writeErr) {
    //     console.error("Failed to write audio file:", writeErr);
    //     // but still send back the audio
    //   } else {
    //     console.log("Audio saved to:", filepath);
    //   }
    // });

    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  });
}

function convertWebmToPcm(webmBuffer) {
  return new Promise((resolve, reject) => {
    // 1) wrap the Buffer in a PassThrough stream
    const inputStream = new PassThrough();
    inputStream.end(webmBuffer);

    const pcmChunks = [];
    const command = ffmpeg(inputStream)
      .inputFormat('webm')            // tell ffmpeg it’s WebM
      .audioFrequency(16000)          // 16 kHz
      .audioChannels(1)               // mono
      .format('s16le')                // raw signed 16‑bit little‑endian
      .on('error', err => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .on('end', () => {
        resolve(Buffer.concat(pcmChunks));
      })
      .pipe();                        // pipe stdout

    // 2) collect the PCM data
    command.on('data', chunk => pcmChunks.push(chunk));
  });
}
module.exports = { sendMessageToLex, sendVoiceToLex };
