window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();


function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasGetUserMedia()) {
  // Good to go!
} else {
  // console.log('getUserMedia() is not supported in your browser');
}

function process(Data) {
  const source = context.createBufferSource(); // Create Sound Source
  context.decodeAudioData(Data, (buffer) => {
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(context.currentTime);
  });
}

const sortByName = (a, b) => {
  const nameA = a.Name.toLowerCase();
  const nameB = b.Name.toLowerCase();
  if (nameA < nameB) // sort string ascending
  {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0; // default return value (no sorting)
};

function loadVoices() {
  const request = new XMLHttpRequest();
  const voiceSelect = document.getElementById('voiceSelect');
  console.log(voiceSelect);
  request.open('GET', '/v1/sounds/voices');
  request.onload = function onVoicesLoad() {
    const Data = JSON.parse(request.response);
    Data.sort(sortByName).forEach(voice => {
      voiceSelect.options[voiceSelect.options.length] = new Option(`${voice.Name} (${voice.LanguageName})`, voice
        .Id);
    });
  };
  request.send();
}

function sayMyName(text, voiceId, greeting) {
  const request = new XMLHttpRequest();
  request.open('POST', '/v1/sounds/create', true);
  request.responseType = 'arraybuffer';

  request.onload = function onLoad() {
    const Data = request.response;
    process(Data);
  };

  request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  request.send(JSON.stringify({
    text,
    voiceId,
    greeting,
  }));
}

function doSomething() { // eslint-disable-line
  const nameField = document.querySelector('[name=yourName]');
  const voiceField = document.getElementById('voiceSelect');
  const voiceId = voiceField.options[voiceField.selectedIndex].value;
  // console.log(nameField.value);
  sayMyName(nameField.value, voiceId, 'hello');
}

loadVoices();
