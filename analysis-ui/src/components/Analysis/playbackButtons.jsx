import React from 'react';
import NavDropdown from 'react-bootstrap/NavDropdown';

const defaultColor = "#5f7485"
const selectedColor = "#99d6ff"
const sceneMovieName = "interactiveMoviePlayer";
const topDownMovieName = "topDownInteractiveMoviePlayer";

class SpeedOption extends React.Component {

    render() {
        return (
            <NavDropdown.Item eventKey={this.props.speed}> 
                {this.props.speed}
            </NavDropdown.Item>
        )
    }
}

class PlaybackButtons extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            speedOptions: ["0.25x", "0.5x", "1x", "2x", "4x", "8x"],
            looping:false,
            paused: false,
        }
    }

    setSpeed = speedChange => {
        this.props.setSceneSpeed(speedChange);
        document.getElementById(sceneMovieName).playbackRate = speedChange.slice(0, -1);
        document.getElementById(topDownMovieName).playbackRate = speedChange.slice(0,-1);
    }

    pause = () => {
        document.getElementById(sceneMovieName).playbackRate = 0;
        document.getElementById(topDownMovieName).playbackRate = 0;
        this.setState({paused:!this.state.paused}, () => {
            document.getElementById(sceneMovieName).playbackRate = this.state.paused ? 0 : this.props.speed.slice(0, -1);
            document.getElementById(topDownMovieName).playbackRate = this.state.paused ? 0 : this.props.speed.slice(0, -1);
        });
    }

    setLoop = reset => {
        let video1 = document.getElementById(sceneMovieName);
        let video2 = document.getElementById(topDownMovieName);
        if(video1!==null && video2!==null) {
            this.setState({looping: reset ? false : !video1.loop}, () => {
                video1.loop = reset ? false : this.state.looping;
                video2.loop = reset ? false : this.state.looping;
                document.getElementById("loopButton").style.background = this.state.looping ? selectedColor : "white";
            });
        }
    }

    reset = () => {
        document.getElementById("pauseButton").style.background = "white";
        this.setState({paused:false});
    }

    playMoviesInSync = () => {
        let sceneMovie = document.getElementById(sceneMovieName);
        let topDownMovie = document.getElementById(topDownMovieName);

        if(!this.state.paused) {
            sceneMovie.currentTime = 0;
            topDownMovie.currentTime = 0;
        }

        sceneMovie.playbackRate = this.props.speed.slice(0, -1);
        topDownMovie.playbackRate = this.props.speed.slice(0, -1);
        sceneMovie.play();
        topDownMovie.play();
        this.setState({paused:false});
        document.getElementById("pauseButton").style.background = "white";
    }

    render() {
        return (
            <div id="playbackButtons" className="movie-playback-buttons-holder" style={{paddingLeft:this.props.paddingLeft}}>
            <button className="movie-playback-button" style={{borderRadius: '10px 0px 0px 10px'}} onClick={this.props.upOneScene}>
                <span style={{color:defaultColor}} className="material-icons">
                    arrow_upward
                </span>
            </button>
            <button className="movie-playback-button" onClick={()=>this.props.downOneScene(this.props.numOfScenes, false)}>
                <span style={{color:defaultColor}} className="material-icons">
                    arrow_downward
                </span>
            </button>
                <NavDropdown title={this.props.speed} id="movieSpeedDropdown" className="movie-speed-dropdown" onSelect={this.setSpeed}>
                {
                    this.state.speedOptions.map(speed => {
                        return(<SpeedOption key={`speedOption-${speed}`} speed={speed}>speed</SpeedOption>)
                    })
                }
                </NavDropdown>
                <button className="movie-playback-button" onClick={this.playMoviesInSync}>
                    <span style={{color:defaultColor}} className="material-icons">
                        play_arrow
                    </span>
                </button>
                <button id="pauseButton" className="movie-playback-button" style={{background: this.state.paused ? selectedColor : "white"}} onClick={this.pause}>
                    <span style={{color:defaultColor}} className="material-icons">
                        pause
                    </span>
                </button>
                <button id="loopButton" className="movie-playback-button" onClick={() => this.setLoop(false)}>
                    <span className="material-icons">
                        repeat
                    </span>
                </button>
                <button id="playAllButton" className="movie-playback-button" style={{paddingBottom:"5px", borderRadius: '0px 10px 10px 0px', background:this.props.playAllState ? selectedColor : "white"}} onClick={this.props.playAll}>
                    Play All
                </button>
            </div>
        )
    }
}

export default PlaybackButtons;