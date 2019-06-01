// eslint-disable-next-line no-undef
const recognition = new window.webkitSpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 3;

export default recognition;
