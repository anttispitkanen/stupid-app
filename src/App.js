import React from 'react';
import './App.css';
import logo from './logo.svg';
import { say } from './synth';

class App extends React.Component {
  state = {
    textLoading: false,
    textError: false,
    originalText: '',
    synonymsLoading: false,
    synonymsError: false,
    synonyms: [],
    synonymizedText: '',
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
    let text = this.state.originalText;

    synonymArray.forEach(syn => {
      const replacement =
        syn.synonyms[Math.floor(Math.random() * syn.synonyms.length)];
      text = text.replace(syn.word, replacement);
    });

    return text;
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
              I don't know, gimme text! :D
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

          {(this.state.textError || this.state.synonymsError) && (
            <span>Error! :DD</span>
          )}
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
            Say it differently
          </button>

          <button
            disabled={this.state.synonymizedText.length === 0}
            onClick={async () => await say(this.state.synonymizedText)}
          >
            Say it out loud! :DD
          </button>
        </div>

        <footer>® Stupidity 2019</footer>

        {(this.state.textLoading || this.state.synonymsLoading) && (
          <img className="App-logo" src={logo} />
        )}
      </div>
    );
  }
}

export default App;
