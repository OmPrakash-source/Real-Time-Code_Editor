const axios = require('axios');

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const RAPIDAPI_KEY = "1847d639e7msh264c4620391f518p101b55jsn12c0099d99f7";
const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com";

// Judge0 ID
const LANGUAGE_ID_MAP = {
    c: 50,
    cpp: 54,
    java: 62,
    python: 71,
    javascript: 63,
    php: 68
};

function decode(field) {
    if (!field) return "";
    return Buffer.from(field, "base64").toString("utf8");
}

async function runCode({ language, sourceCode, stdin }) {
    const languageId = LANGUAGE_ID_MAP[language]; //convert language to judge0 id
    if (!languageId) throw new Error("Unsupported language");

    const headers = {
        "content-type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    };

    const payload = {
        source_code: Buffer.from(sourceCode).toString("base64"),
        language_id: languageId,
        stdin: stdin ? Buffer.from(stdin).toString("base64") : null
    };
    console.log('Judge0 Payload:', JSON.stringify(payload, null, 2));

    const params = {
        base64_encoded: true,
        wait: true,
        fields: "*"
    };

    const res = await axios.post(
        `${JUDGE0_URL}/submissions`,
        payload,
        { params, headers }
    );

    const out = res.data; //Extract Response Data

    return {
        stdout: decode(out.stdout), //Decode Base64 to UTF-8  Return Formatted Results
        stderr: decode(out.stderr || out.compile_output || out.message),
        time: out.time,
        memory: out.memory
    };
}

module.exports = { runCode };
