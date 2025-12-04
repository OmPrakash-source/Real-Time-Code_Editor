const express = require('express');
const { runCode } = require('../compiler/judge0');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { code, language, stdin } = req.body || {};
        console.log('Compile Request:', { language, stdin, codeLength: code?.length });

        if (typeof code !== 'string' || !code.trim()) {
            return res.status(400).json({ error: 'Code is required' });
        }
        if (typeof language !== 'string' || !language.trim()) {
            return res.status(400).json({ error: 'Language is required' });
        }

        const result = await runCode({
            language: language.trim(),
            sourceCode: code,
            stdin: stdin || ''
        });

        return res.json({
            stdout: result.stdout,
            stderr: result.stderr,
            time: result.time,
            memory: result.memory
        });
    } catch (err) {
        console.error('Compile error:', err.message);
        return res.status(500).json({ error: 'Failed to compile code' });
    }
});

module.exports = router;
