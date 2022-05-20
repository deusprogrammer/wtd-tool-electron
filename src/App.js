import './App.css';
import React, {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';

import ClipEditor from './routes/ClipEditor';
import VideoList from './routes/VideoList';
import VideoView from './routes/VideoView';
import Config from './routes/Config';
import About from './routes/About';

import 'react-toastify/dist/ReactToastify.css';


let App = (props) => {
    return (
        <div className="App">
            <ToastContainer />
            <Router>
                <h1>What the Dub Tools</h1>
                <hr/>
                <div>v1.5.0b</div>
                <hr/>
                <div style={{minHeight: "50vh"}}>
                    <Routes>
                        <Route exact path={`/`} element={<VideoList />} />
                        <Route exact path={`/about`} element={<About />} />
                        <Route exact path={`/config`} element={<Config />} />
                        <Route exact path={`/create/:type`} element={<ClipEditor />} />
                        <Route exact path={`/videos`} element={<VideoList />} />
                        <Route exact path={`/videos/:game/:id`} element={<VideoView />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
