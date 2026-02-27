const express = require('express');
const fs = require('fs');
const { maxifyStack } = require('@timber-logging/maxify-stack-utils');
const app = express();

// START by running "npm start" in your console and navigating to http://localhost:4000 in your browser

// select any port you want, but it is probably useful not to use the one your app uses
// so you can run both at the same time (which is why we're using 4000 instead of 3000)
const port = 4000;

app.use(express.json());
app.use(express.static('public'));

app.get('/config', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('./folder-paths.json', 'utf8'));
        res.json(Array.isArray(data) ? data : []);
    } catch (e) {
        res.json([]);
    }
});

app.post('/go', async (req, res) => {
    try {
      const { folder, input } = req.body;
      const output = await maxifyStack(folder, input);
      // console.log(output)
      res.json(output);
    } catch (e) {
      res.json({ error: `Something went wrong: ${e.message}` });
    }
});

app.listen(port, () => console.log(`Maxify Stack running at http://localhost:${port} (modify server.js to change the port)`));
