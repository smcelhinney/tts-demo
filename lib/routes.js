const express = require('express');
const debug = require('debug')('sounds');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const stream = require('stream');
const translations = require('../data/translations');
const moment = require('moment');

const router = express.Router();
let voices;

if (process.env.NODE_ENV !== 'production') {
  dotenv.load();
}

const polly = new AWS.Polly();
polly.describeVoices({}, (err, data) => {
  if (err) debug(err, err.stack);
  debug(data.Voices);
  voices = data.Voices.filter(voice => Object.keys(translations).indexOf(voice.LanguageCode) > -1);
});

const say = (msg, res) => {
  const synthCallback = (err, data) => {
    if (err) debug(err.stack); // an error occurred
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
  polly.synthesizeSpeech(msg, synthCallback);
};

router.get('/voices', (req, res, next) => {
  res.status(200).send(voices);
});

router.post('/create', (req, res, next) => {
  const language = voices.find(voice => voice.Id === req.body.voiceId).LanguageCode;
  const locale = language.substr(0, language.indexOf('-'));
  moment.locale(locale);

  const Text = (translations[language] || {
    hello: 'Hello #Text',
  })[req.body.greeting]
    .replace(/#TEXT#/g, req.body.text)
    .replace(/#WEEKDAY#/g, moment().format('dddd'));

  say({
    OutputFormat: 'mp3', // You can also specify pcm or ogg_vorbis formats.
    Text,
    VoiceId: req.body.voiceId, // Specify the voice ID / name from the previous step.
  }, res);
});

module.exports = router;
