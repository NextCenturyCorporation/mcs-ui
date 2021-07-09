import React from 'react'

const defaultColor = "rgb(100,115,135)";
const selectedColor = "rgb(200, 214, 255)";
const defaultTextColor = "white";
const selectedTextColor = "black"
const sceneMovie = "interactiveMoviePlayer";
const topDownMovie = "topDownInteractiveMoviePlayer";

class PlaybackButtons extends React.Component{

    constructor(props) {
        super(props);
    }

    setSpeed = (speed, btnName, className, movieId) => {
        document.getElementById(movieId).playbackRate = speed;
        let playBackBtns = document.getElementsByClassName(className);
        for(let i=0; i<playBackBtns.length; i++) {
            playBackBtns[i].style.backgroundColor = playBackBtns[i].id === btnName ? selectedColor : defaultColor;
            playBackBtns[i].style.color = playBackBtns[i].id === btnName ? selectedTextColor : defaultTextColor;
        }
    }

    setLoop = (btnId, movieId, reset=false) => {
        let video = document.getElementById(movieId);
        video.loop = reset ? false : !video.loop;
        document.getElementById(btnId).style.backgroundColor = video.loop ? selectedColor : defaultColor;
        document.getElementById(btnId).style.color = video.loop ? selectedTextColor : defaultTextColor;
    }

    playMoviesInSync = (sceneMovieId, topDownMovieId) => {
        let sceneMovie = document.getElementById(sceneMovieId);
        let topDownMovie = document.getElementById(topDownMovieId);
        sceneMovie.currentTime = 0;
        topDownMovie.currentTime = 0;
        sceneMovie.play();
        topDownMovie.play();
    }

    reset = () => {
        this.setSpeed(1, "1x-btn", "scene-movie-playback-button", sceneMovie);
        this.setSpeed(1, "td-1x-btn", "topdown-movie-playback-button", topDownMovie);
        this.setLoop("scene-loop-video-button",sceneMovie, true);
        this.setLoop("topdown-loop-video-button",topDownMovie, true);
    }

    render() {
        return (
            <div id="playbackButtons" className="movie-playback-buttons-holder">
                <div className="scene-movie-playback-buttons-holder">
                    <button className="scene-movie-playback-button" id=".25x-btn" 
                        onClick={() => this.setSpeed(0.25, ".25x-btn", "scene-movie-playback-button", sceneMovie)}> 0.25x </button>
                    <button className="scene-movie-playback-button" id=".5x-btn" 
                        onClick={() => this.setSpeed(0.5, ".5x-btn", "scene-movie-playback-button", sceneMovie)}> 0.5x </button>
                    <button className="scene-movie-playback-button" id="1x-btn"
                        onClick={() => this.setSpeed(1, "1x-btn", "scene-movie-playback-button", sceneMovie)} 
                        style= {{backgroundColor: selectedColor, color:selectedTextColor}}> 1x </button>
                    <button className="scene-movie-playback-button" id="2x-btn" 
                        onClick={() => this.setSpeed(2, "2x-btn", "scene-movie-playback-button", sceneMovie)}> 2x </button>
                    <button className="scene-movie-playback-button" id="4x-btn" 
                        onClick={() => this.setSpeed(4, "4x-btn", "scene-movie-playback-button", sceneMovie)}> 4x </button>
                    <button className="scene-movie-playback-button" id="8x-btn"
                        onClick={() => this.setSpeed(8, "8x-btn", "scene-movie-playback-button", sceneMovie)}> 8x </button>
                    <button className="loop-video-button" id="scene-loop-video-button" 
                        onClick={()=> this.setLoop("scene-loop-video-button",sceneMovie)}>Loop</button>
                </div>
                <div className="sync-video-button-holder" style={{paddingLeft:this.props.syncButtonPaddingLeft}}>
                    <button className="sync-video-button" id="sync-video-button" 
                        onClick={()=> this.playMoviesInSync("interactiveMoviePlayer","topDownInteractiveMoviePlayer")}>Sync Play</button>
                </div>
                <div className="topdown-movie-playback-buttons-holder" style={{paddingLeft:this.props.topdDownButtonPaddingLeft}}>
                    <button className="topdown-movie-playback-button" id="td-.25x-btn" 
                        onClick={() => this.setSpeed(0.25, "td-.25x-btn", "topdown-movie-playback-button", topDownMovie)}> 0.25x </button>
                    <button className="topdown-movie-playback-button" id="td-.5x-btn" 
                        onClick={() => this.setSpeed(0.5, "td-.5x-btn", "topdown-movie-playback-button", topDownMovie)}> 0.5x </button>
                    <button className="topdown-movie-playback-button" id="td-1x-btn" 
                        onClick={() => this.setSpeed(1, "td-1x-btn", "topdown-movie-playback-button", topDownMovie)} 
                        style= {{backgroundColor: selectedColor, color:selectedTextColor}}> 1x </button>
                    <button className="topdown-movie-playback-button" id="td-2x-btn" 
                        onClick={() => this.setSpeed(2, "td-2x-btn", "topdown-movie-playback-button", topDownMovie)}> 2x </button>
                    <button className="topdown-movie-playback-button" id="td-4x-btn" 
                        onClick={() => this.setSpeed(4, "td-4x-btn", "topdown-movie-playback-button", topDownMovie)}> 4x </button>
                    <button className="topdown-movie-playback-button" id="td-8x-btn"
                        onClick={() => this.setSpeed(8, "td-8x-btn", "topdown-movie-playback-button", topDownMovie)}> 8x </button>
                    <button className="loop-video-button" id="topdown-loop-video-button" 
                        onClick={()=> this.setLoop("topdown-loop-video-button",topDownMovie)}>Loop</button>
                </div>
            </div>
        )
    }
}

export default PlaybackButtons;