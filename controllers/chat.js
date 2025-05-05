const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const { BedrockAgentRuntimeClient, InvokeFlowCommand } = require("@aws-sdk/client-bedrock-agent-runtime");
const { TranscribeStreamingClient, StartStreamTranscriptionCommand } = require("@aws-sdk/client-transcribe-streaming");
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
const { PassThrough } = require('stream');
const { log } = require("console");
require('dotenv').config();

const REGION = "us-east-1";

const pollyClient = new PollyClient({ 
  region: REGION,
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});
const agentClient = new BedrockAgentRuntimeClient({
  region: REGION, // 注意：Flow 建在哪個 region 就用哪個
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});
const transcribeClient = new TranscribeStreamingClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});

// 你自建的 Flow Id 跟 Model ARN
// const FLOW_ID = process.env.BEDROCK_FLOW_ID;
// const FLOW_MODEL_ARN = process.env.BEDROCK_FLOW_MODEL_ARN;

// 語音訊息處理
async function sendVoiceToBot(req, res) {
  const hostname = req.hostname.split('.')[0];

  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }

  if (req.file.mimetype !== 'audio/webm') {
    return res.status(400).send('Invalid audio format. Please upload a WebM file.');
  }

  const sessionId = req.body.sessionId;

  try {
    // 1. 轉換 WebM 為 PCM
    const pcmBuffer = await convertWebmToPcm(req.file.buffer);

    // 2. 語音轉文字（Nova Sonic）
    const text = await transcribeWithTranscribe(pcmBuffer);

    // 3. 丟到 Bedrock Flow
    const reply = await callFlowWithText(text, sessionId, hostname);

    // 4. 將回覆轉語音（Polly）
    const audioBuffer = await textToSpeech(reply);

    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err) {
    console.error("Voice processing error:", err);
    res.status(500).send('Error processing voice input');
  }
}

// 文本訊息處理
async function sendMessageToBot(req, res) {
  const hostname = req.hostname.split('.')[0];
  const { message, sessionId } = req.body;

  try {
    const reply = await callFlowWithText(message, sessionId, hostname);
    res.json({ response: reply, sessionId });
  } catch (err) {
    console.error("Text processing error:", err);
    res.status(500).json({ error: "Flow API Error" });
  }
}

// 語音轉文字（Nova Sonic）
async function transcribeWithTranscribe(pcmBuffer) {
  const CHUNK_SIZE = 1024 * 4; // 16KB

  const command = new StartStreamTranscriptionCommand({
    LanguageCode: "en-US",
    MediaEncoding: "pcm",
    MediaSampleRateHertz: 16000,
    AudioStream: (async function* () {
      for (let i = 0; i < pcmBuffer.length; i += CHUNK_SIZE) {
        const chunk = pcmBuffer.slice(i, i + CHUNK_SIZE);
        yield { AudioEvent: { AudioChunk: chunk } };
        await new Promise(resolve => setTimeout(resolve, 20)); // 模擬實時傳輸
      }
    })(),
  });

  let transcript = '';

  try {
    const response = await transcribeClient.send(command);
    for await (const event of response.TranscriptResultStream) {
      if (event.TranscriptEvent) {
        const results = event.TranscriptEvent.Transcript.Results;
        for (const result of results) {
          if (!result.IsPartial && result.Alternatives.length > 0) {
            transcript = result.Alternatives[0].Transcript;
          }
        }
      }
    }
  } catch (err) {
    console.error("Transcribe error:", err);
    throw err;
  }

  console.log("transcript.tirm():", transcript.trim());
  return transcript.trim();
}

// 呼叫 Flow
async function callFlowWithText(text, sessionId, hostname) {
  queryText = "I am from " + hostname + ", " + text;
  const input = {
    flowIdentifier: "VMSJ77E6MK",           // Flow ID
    flowAliasIdentifier: "G9ANWOCQ8Y",      // Flow Alias
    inputs: [
      {
        content: 
        {
          document: queryText,
        },
        nodeName: "FlowInputNode",
        nodeOutputName: "document",
      },
    ],
  };
  const command = new InvokeFlowCommand(input);

  const response = await agentClient.send(command);
  // console.log("Response:", JSON.stringify(response, null, 2));
  console.log("flow output: ", response);

  let flowResponse = {};
  for await (const chunkEvent of response.responseStream) {
    const { flowOutputEvent, flowCompletionEvent } = chunkEvent;

    if (flowOutputEvent) {
      flowResponse = { ...flowResponse, ...flowOutputEvent };
      // console.log("Flow output event:", flowOutputEvent);
    } else if (flowCompletionEvent) {
      flowResponse = { ...flowResponse, ...flowCompletionEvent };
      // console.log("Flow completion event:", flowCompletionEvent);
    }
  }

  console.log("flowResponse: ", flowResponse);
  return flowResponse.content.document || "No response from bot";
}

// 文字轉語音（Polly）
async function textToSpeech(text) {
  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: text,
    VoiceId: "Matthew", // 可選其它 Polly 聲音
    Engine: "neural",
  });

  const response = await pollyClient.send(command);
  return await streamToBuffer(response.AudioStream);
}

// 工具方法
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    let data = "";
    stream.on("data", chunk => (data += chunk));
    stream.on("end", () => resolve(data));
    stream.on("error", reject);
  });
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function convertWebmToPcm(webmBuffer) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(webmBuffer);

    const pcmChunks = [];
    const command = ffmpeg(inputStream)
      .inputFormat('webm')
      .audioFrequency(16000)
      .audioChannels(1)
      .format('s16le')
      .on('error', err => reject(err))
      .on('end', () => resolve(Buffer.concat(pcmChunks)))
      .pipe();

    command.on('data', chunk => pcmChunks.push(chunk));
  });
}

module.exports = {
  sendMessageToBot,
  sendVoiceToBot,
};
