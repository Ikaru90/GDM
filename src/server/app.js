import express from 'express';

const app = express();
const port = process.env.PORT || 80;

app.get('/', (req, res) => res.send(''));

app.listen(port, () => console.log(`Listening on port ${port}!`));
