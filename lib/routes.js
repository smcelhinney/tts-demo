const express = require('express');
const debug = require('debug')('sounds');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const stream = require('stream');

const router = express.Router();
if (process.env.NODE_ENV !== 'production') {
  dotenv.load();
}

const polly = new AWS.Polly();

router.post('/create', (req, res, next) => {
  debug(req.body);
  let options = {
    LanguageCode: "en-GB",
  };
  options = {};
  polly.describeVoices(options, (err, data) => {
    if (err) debug(err, err.stack); // an error occurred
    else debug(data); // successful response
  });

  const params = {
    OutputFormat: 'mp3', // You can also specify pcm or ogg_vorbis formats.
    Text: `Hello, I believe your name is ${req.body.text}. Would you like me to tell you a story?`, // This is where you'll specify whatever text you want to render.
    VoiceId: req.body.voiceId, // Specify the voice ID / name from the previous step.
  };

  const synthCallback = (err, data) => {
    if (err) debug(err.stack); // an error occurred
    else debug(data); // successful response

    const bufferStream = new stream.PassThrough();

    // Write your buffer
    bufferStream.end(new Buffer(data.AudioStream));
    res.set({
      'Content-Type': 'audio/mpeg',
    });
    bufferStream.on('error', bufferError => {
      debug(bufferError);
      res.status(400).end();
    });
    // Pipe it to something else  (i.e. stdout)
    bufferStream.pipe(res);
  };

  polly.synthesizeSpeech(params, synthCallback);
});

module.exports = router;
