import React from 'react';
import './App.css';
import logo from './logo.svg';
import { say } from './synth';
import recognition from './speechRecognition';

class App extends React.Component {
  state = {
    textLoading: false,
    textError: false,
    originalText: '',
    synonymsLoading: false,
    synonymsError: false,
    synonyms: [],
    synonymizedText: '',
    syllablesLoading: false,
    syllablesError: false,
    syllables: [],
  };

  componentDidMount = () => {
    recognition.onresult = event => {
      const transcript =
        event.results &&
        event.results[0] &&
        event.results[0][0] &&
        event.results[0][0].transcript;

      this.setState({
        originalText: transcript,
      });
    };
  };

  listen = () => {
    recognition.start();
  };

  fetchRandomText = async () => {
    try {
      this.setState({ textLoading: true, textError: false });
      const res = await fetch('http://localhost:3001/random-text?lang=en');
      if (!res.ok) throw Error('text res not ok! :DD');
      const data = await res.json();
      this.setState({
        textError: false,
        textLoading: false,
        originalText: data.description,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        textError: true,
        textLoading: false,
      });
    }
  };

  writeText = event => {
    this.setState({
      originalText: event.target.value,
    });
  };

  fetchSynonyms = async () => {
    const body = { text: this.state.originalText };

    try {
      this.setState({ synonymsLoading: true, synonymsError: false });
      const res = await fetch('http://localhost:3001/synonymize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw Error('synonym res not ok! :DD');

      const data = await res.json();
      const filteredData = data.filter(wobj => wobj.synonyms.length > 0);

      this.setState({
        synonymsError: false,
        synonymsLoading: false,
        synonyms: filteredData,
        synonymizedText: this.reword(filteredData),
        syllables: [],
      });
    } catch (err) {
      console.error('Error! :DD' + err);
      this.setState({
        synonymsError: true,
        synonymsLoading: false,
      });
    }
  };

  reword = synonymArray => {
    this.setState({
      syllables: [],
    });

    let text = this.state.originalText;

    synonymArray.forEach(syn => {
      // create array where original word is appended to synonyms,
      // otherwise the original word is never used
      const synonymsAndWord = [...syn.synonyms, syn.word];
      const replacement =
        synonymsAndWord[Math.floor(Math.random() * synonymsAndWord.length)];
      text = text.replace(new RegExp(syn.word, 'i'), replacement);
    });

    return text;
  };

  syllableize = async () => {
    const body = { text: this.state.synonymizedText };

    try {
      this.setState({ syllablesLoading: true, syllablesError: false });
      const res = await fetch('http://localhost:3001/syllables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw Error('syllables re not ok! :DD');

      const data = await res.json();
      const filteredData = data.filter(
        wobj => wobj && wobj.syllables && wobj.syllables.length > 1,
      );

      // some syllables come in empty, such as ["a", "", "r"], filter those out
      const fixedData = filteredData.map(wordObj => ({
        ...wordObj,
        syllables: wordObj.syllables.filter(syl => syl && syl.length > 0),
      }));

      // syllableize words that match
      let text = this.state.synonymizedText;

      fixedData.forEach(syllableObject => {
        text = text.replace(
          new RegExp(syllableObject.word, 'i'),
          syllableObject.syllables.join('-'),
        );
      });

      this.setState({
        syllablesError: false,
        syllablesLoading: false,
        syllables: fixedData,
        synonymizedText: text,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        syllablesLoading: false,
        syllablesError: true,
        syllables: [],
      });
    }
  };

  render() {
    return (
      <div className="App">
        <h1>Make yourself more expressive! :DD</h1>

        <div id="text-source-container">
          <textarea
            className="text-area"
            placeholder="Write some text here :DD"
            value={this.state.originalText}
            onChange={this.writeText}
          />
          <div id="source-text-buttons-container">
            <button onClick={this.fetchRandomText}>
              I don't know, gimme text! :DD
            </button>
            <button onClick={this.listen}>
              Hold on I want to say something! :DD
            </button>
            <button
              disabled={
                this.state.originalText.length < 10 ||
                this.state.originalText.length > 400
              }
              onClick={this.fetchSynonyms}
            >
              Do magic! :DD
            </button>
          </div>

          {(this.state.textError ||
            this.state.synonymsError ||
            this.state.syllablesError) && <span>Error! :DD</span>}
        </div>

        <div id="synonymized-text-container">
          <h2>Here is how you could say that :DD</h2>
          <p>{this.state.synonymizedText}</p>
          <button
            disabled={this.state.synonyms.length === 0}
            onClick={() =>
              this.setState({
                synonymizedText: this.reword(this.state.synonyms),
              })
            }
          >
            Say it differently! :DD
          </button>

          <button
            disabled={
              this.state.synonymizedText.length === 0 ||
              this.state.syllables.length > 0
            }
            onClick={this.syllableize}
          >
            Make it easier! :DD
          </button>

          <button
            disabled={this.state.synonymizedText.length === 0}
            onClick={async () => await say(this.state.synonymizedText)}
          >
            Say it out loud! :DD
          </button>
        </div>

        <footer>® Stupidity 2019</footer>

        {(this.state.textLoading ||
          this.state.synonymsLoading ||
          this.state.syllablesLoading) && (
          <img className="App-logo" src={logo} />
        )}
      </div>
    );
  }
}

export default App;
