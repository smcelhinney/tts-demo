window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

function doSomething() {
  const nameField = document.querySelector('[name=yourName]');
  console.log(nameField.value);
  sayMyName(nameField.value);
}

function process(Data) {
  const source = context.createBufferSource(); // Create Sound Source
  context.decodeAudioData(Data, (buffer) => {
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(context.currentTime);
  });
}

function sayMyName(text) {
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
    voiceId: 'Amy',
  }));
}
