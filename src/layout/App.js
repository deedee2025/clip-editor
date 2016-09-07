/* global ActiveXObject */
import React, { Component } from 'react';
import MainHeader from './MainHeader';
import VideoPlayer from '../components/VideoPlayer';
import ClipList from '../components/ClipList';
import ClipEditor from '../components/ClipEditor';

class App extends Component {
  constructor(props) {
    super(props);

    // Simulate server data
    const video = {
      id: 'sd67f9dsjdf967',
      name: 'Sintel Trailer',
      fileUrl: '/src/assets/videos/main-video.mp4',
      thumbs: '/src/assets/img/main-video_thumbs.jpg',
      clips: [],
      videoElem: null,
    };
    let mainVideo = localStorage.getItem(`video.${video.id}`);
    if (!mainVideo) {
      mainVideo = video;
    } else {
      mainVideo = JSON.parse(mainVideo);
    }

    this.state = {
      mainVideo, currentClip: null, playingClip: null, autoPlay: false,
      jumpSecond: null, editableOptions: true,
    };
    const usedIds = mainVideo.clips.map(clip => clip.id);
    const max = usedIds.length > 0 ? Math.max.apply(null, usedIds) : 0;
    this.clipIds = mainVideo ? max : 0;
    this.jumpClipInterval = null;
    this.jumpSencods = 3;

    this.onCreateClip = this.onCreateClip.bind(this);
    this.onClipChange = this.onClipChange.bind(this);
    this.onVideoLoaded = this.onVideoLoaded.bind(this);
    this.onEditorSaveClip = this.onEditorSaveClip.bind(this);
    this.onEditorCancel = this.onEditorCancel.bind(this);
    this.onListItemPlay = this.onListItemPlay.bind(this);
    this.onPlayerClipEnds = this.onPlayerClipEnds.bind(this);
    this.onJumpClipIntervalHandler = this.onJumpClipIntervalHandler.bind(this);
    this.onCancelJumpClick = this.onCancelJumpClick.bind(this);
    this.onPlayerIndicatorClick = this.onPlayerIndicatorClick.bind(this);

    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.updateLocalData = this.updateLocalData.bind(this);
    this.jumpToClip = this.jumpToClip.bind(this);
    this.toggleEditableOptions = this.toggleEditableOptions.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keyup', (e) => {
      if ((e.ctrlKey && (e.which && e.which === 38)) || (e.keyCode && e.keyCode === 38)) {
        this.onCancelJumpClick();
        this.jumpToClip(false);
        this.setState({ autoPlay: true });
      }
      if ((e.ctrlKey && (e.which && e.which === 40)) || (e.keyCode && e.keyCode === 40)) {
        this.onCancelJumpClick();
        this.jumpToClip();
        this.setState({ autoPlay: true });
      }
    }, false);
  }

  componentDidUpdate() {
    this.updateLocalData();
  }

  onCreateClip() {
    const { mainVideo } = this.state;
    this.clipIds++;
    mainVideo.clips.push({
      id: this.clipIds,
      name: `Clip ${this.clipIds}`,
      isNew: true,
    });
    this.setState({ mainVideo });
  }

  onClipChange(clip, deleted = false) {
    if (deleted) {
      const { mainVideo, currentClip } = this.state;
      if (mainVideo && mainVideo.clips) {
        const persistentClips = mainVideo.clips.filter(oClip => oClip.id !== clip);
        mainVideo.clips = persistentClips;
        const newState = { mainVideo };
        if (currentClip && currentClip.id === clip) newState.currentClip = null;
        this.setState(newState);
      }
    } else {
      this.setState({ currentClip: clip });
    }
  }

  onVideoLoaded(videoElem) {
    this.setState({ videoElem });
  }

  onEditorSaveClip(clip) {
    const { mainVideo, playingClip } = this.state;
    const modClip = mainVideo.clips.filter(oClip => oClip.id === clip.id);
    if (modClip.length > 0) {
      const indx = mainVideo.clips.indexOf(modClip[0]);
      mainVideo.clips[indx] = clip;
      const newState = { mainVideo };
      if (playingClip && playingClip.id === clip.id) newState.playingClip = clip;
      this.setState(newState);
    }
    this.setState({ currentClip: null });
  }

  onEditorCancel() {
    this.setState({ currentClip: null });
  }

  onListItemPlay(clip, play) {
    this.setState({ playingClip: clip, autoPlay: play });
  }

  onPlayerClipEnds(clip) {
    const { mainVideo, playingClip } = this.state;
    if (clip && clip.id === playingClip.id) {
      if (mainVideo.clips.indexOf(playingClip) < mainVideo.clips.length - 1) {
        this.jumpSencods = 3;
        this.jumpCancelled = false;
        this.setState({ jumpSecond: this.jumpSencods });
        this.jumpClipInterval = setInterval(this.onJumpClipIntervalHandler, 1000);
      }
    }
  }

  onJumpClipIntervalHandler() {
    if (this.jumpSencods === 1 && !this.jumpCancelled) {
      this.jumpSencods = 3;
      clearInterval(this.jumpClipInterval);
      this.jumpClipInterval = null;
      this.jumpToClip();
    } else {
      this.jumpCancelled = false;
      this.jumpSencods--;
      this.setState({ jumpSecond: this.jumpSencods });
    }
  }

  onCancelJumpClick() {
    clearInterval(this.jumpClipInterval);
    this.jumpClipInterval = null;
    this.jumpCancelled = true;
    this.setState({ jumpSecond: null });
  }

  onPlayerIndicatorClick(clipId) {
    this.jumpCancelled = true;
    const { mainVideo } = this.state;
    const clickedClip = mainVideo.clips.filter(clip => clip.id === clipId);
    if (clickedClip.length > 0) {
      this.setState({ playingClip: clickedClip[0], jumpSecond: null, autoPlay: true });
    }
  }

  toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement && !document.mozFullScreenElement
      && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  updateLocalData() {
    const { mainVideo } = this.state;
    if (mainVideo) {
      localStorage.setItem(`video.${mainVideo.id}`, JSON.stringify(mainVideo));
    }
  }

  jumpToClip(next = true) {
    this.jumpCancelled = true;
    const { mainVideo, playingClip } = this.state;
    const currentIndex = mainVideo.clips.indexOf(playingClip);
    let nextClip = null;
    if (next) {
      if (currentIndex < mainVideo.clips.length - 1) {
        nextClip = mainVideo.clips[currentIndex + 1];
      }
    } else {
      if (currentIndex > 0) {
        nextClip = mainVideo.clips[currentIndex - 1];
      }
    }
    if (nextClip) {
      this.setState({ playingClip: nextClip, jumpSecond: null });
    }
  }

  toggleEditableOptions() {
    const { editableOptions } = this.state;
    this.setState({ editableOptions: !editableOptions });
  }

  render() {
    const {
      mainVideo, currentClip, videoElem, playingClip, autoPlay, jumpSecond, editableOptions,
    } = this.state;
    return (
      <div>
        <MainHeader />

        <div className="main-content">
          <div className="main-toolbar">
            <ul className="button-set">
              <li>
                <button
                  className="btn btn-icon"
                  title="Toggle fullscreen"
                  onClick={this.toggleEditableOptions}
                >
                  <i className="glyphicon glyphicon-edit" />
                </button>
              </li>
              <li>
                <button
                  className="btn btn-icon"
                  title="Toggle fullscreen"
                  onClick={this.toggleFullscreen}
                >
                  <i className="glyphicon glyphicon-fullscreen" />
                </button>
              </li>
            </ul>
          </div>

          <div className="video-layout">
            <div className="clip-list-container">
              <ClipList
                video={mainVideo}
                onAddClip={this.onCreateClip}
                onClipChange={this.onClipChange}
                onPlayClick={this.onListItemPlay}
                playingClip={playingClip}
                isPlaying={autoPlay}
                editableOptions={editableOptions}
              />
            </div>
            <div className="video-player-container">
              <VideoPlayer
                video={mainVideo}
                onLoaded={this.onVideoLoaded}
                clip={playingClip}
                autoPlay={autoPlay}
                onClipEnds={this.onPlayerClipEnds}
                onClipIndicatorClick={this.onPlayerIndicatorClick}
              />
              <div className={`video-player__jump-on ${jumpSecond !== null ? 'show' : ''}`}>
                <span>{jumpSecond || 0}</span> Seconds left to the next
                <button className="btn btn-link" onClick={this.onCancelJumpClick}>Cancel</button>
              </div>
            </div>
          </div>

          <div className="clip-controls">
            {editableOptions && videoElem ? (
              <ClipEditor
                clip={currentClip}
                videoElem={videoElem}
                video={mainVideo}
                onSaveClip={this.onEditorSaveClip}
                onCancel={this.onEditorCancel}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
