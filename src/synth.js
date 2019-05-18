export async function say(text) {
  const synth = window.speechSynthesis;
  const voices = await synth.getVoices();
  const enVoices = voices.filter(v => v.lang.indexOf('en-') !== -1);
  console.log(enVoices);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = enVoices[Math.floor(Math.random() * enVoices.length)];
  utterance.lang = 'en-US';
  utterance.pitch = Math.random() * (1.8 - 0.2) + 0.2;
  utterance.rate = Math.random() * (1.8 - 0.2) + 0.2;
  synth.speak(utterance);
}
