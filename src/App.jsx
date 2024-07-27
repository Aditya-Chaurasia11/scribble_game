// client/src/App.js
import React, { useState } from 'react';
import Canvas from './Component/Canvas';
import io from 'socket.io-client';
import Temp from './Pages/Temp';

const socket = io(`http://localhost:5000`);

const App = () => {
    const [guess, setGuess] = useState('');
    const [messages, setMessages] = useState([]);

    const handleGuessSubmit = (e) => {
        e.preventDefault();
        socket.emit('guess', guess);
        setGuess('');
    };

    socket.on('guess', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    });

    return (
        <div>
            <Canvas />
            <form onSubmit={handleGuessSubmit}>
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Your guess..."
                />
                <button type="submit">Submit</button>
            </form>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;
