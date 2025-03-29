const AWS = require("aws-sdk");
require('dotenv').config(); // 確保第一行載入


// 設定 AWS Lex
AWS.config.update({
    region: "us-east-1", // 替換成你的 Lex 所在區域
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
});

const lexRuntime = new AWS.LexRuntimeV2();

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

module.exports = { sendMessageToLex };
