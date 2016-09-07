import React, { Component, PropTypes } from 'react';
import libHelper from '../lib/helpers';

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: true,
      forward: false,
      backward: false,
      disabled: true,
      progress: 0,
      duration: 0,
      elapsedTime: 0,
      speed: 1,
    };

    this.sendScreenInfo = this.sendScreenInfo.bind(this);
    this.backwardIntervalFunc = this.backwardIntervalFunc.bind(this);

    this.togglePause = this.togglePause.bind(this);
    this.forward = this.forward.bind(this);
    this.backward = this.backward.bind(this);
  }

  componentDidMount() {
    const { onLoaded, onClipEnds } = this.props;
    const $videoObject = this.refs.videoObject;
    $videoObject.addEventListener('loadeddata', () => {
      if ($videoObject.readyState === 4 || $videoObject.readyState === 3) {
        this.setState({ disabled: false, duration: $videoObject.duration });
        if (onLoaded) onLoaded($videoObject);
      }
    }, false);
    $videoObject.addEventListener('timeupdate', () => {
      const progress = Math.floor((100 / $videoObject.duration) *
        $videoObject.currentTime);
      this.setState({ progress, elapsedTime: $videoObject.currentTime });
    }, false);
    $videoObject.addEventListener('pause', () => {
      if (!this.pausedByButton && this.props.clip) {
        onClipEnds(this.props.clip);
      }
      this.pausedByButton = false;
      this.setState({ paused: true, forward: false, backward: false });
    });
    $videoObject.addEventListener('play', () => {
      this.setState({ paused: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { clip, autoPlay } = nextProps;
    if (clip !== this.props.clip || autoPlay !== this.props.autoPlay) {
      this.setState({ paused: true });
      this.reloadVideo = true;
    }
  }

  componentDidUpdate() {
    const { autoPlay } = this.props;
    if (this.reloadVideo) {
      this.reloadVideo = false;
      this.refs.videoObject.load();
      if (autoPlay) this.refs.videoObject.play();
    }
  }

  sendScreenInfo() {
    const $visibleInfo = this.refs.visibleInfo;
    $visibleInfo.style.display = 'inline-block';
    if (this.sInfoTimeout) clearTimeout(this.sInfoTimeout);
    this.sInfoTimeout = setTimeout(() => {
      $visibleInfo.style.display = 'none';
    }, 2000);
  }

  togglePause() {
    this.pausedByButton = false;
    if (this.backwardInterval) {
      if (this.backwardInterval) clearInterval(this.backwardInterval);
      this.backwardInterval = null;
    }

    const $videoObject = this.refs.videoObject;
    if ($videoObject.readyState === 4 || $videoObject.readyState === 3) {
      $videoObject.playbackRate = 1;

      if ($videoObject.paused) {
        $videoObject.play();
      } else {
        this.pausedByButton = true;
        $videoObject.pause();
      }
      this.setState({ speed: 1, backward: false, forward: false });
    }
  }

  forward() {
    const $videoObject = this.refs.videoObject;
    if ($videoObject.readyState === 4 || $videoObject.readyState === 3) {
      const { backward, forward } = this.state;
      let { speed } = this.state;
      if (backward) speed = 2;
      if (forward) {
        if (speed < 10) speed++;
      } else {
        speed = 2;
      }

      $videoObject.playbackRate = speed;
      $videoObject.play();
      this.setState({ paused: false, backward: false, forward: true, speed });
      this.sendScreenInfo();
    }
  }

  backwardIntervalFunc() {
    const { speed, backward } = this.state;
    if (!backward) {
      if (this.backwardInterval) {
        clearInterval(this.backwardInterval);
        this.backwardInterval = null;
      }
      return;
    }
    const $videoObject = this.refs.videoObject;
    $videoObject.currentTime += (speed * 0.25);
    if ($videoObject.currentTime <= 0) {
      clearInterval(this.backwardInterval);
      this.backwardInterval = null;
      this.setState({ paused: true, backward: false, forward: false, speed: 1 });
    }
  }

  backward() {
    const $videoObject = this.refs.videoObject;
    if ($videoObject.readyState === 4 || $videoObject.readyState === 3) {
      const { backward, forward } = this.state;
      let { speed } = this.state;
      if (forward) speed = -2;
      if (backward) {
        if (speed > -10) speed--;
      } else {
        speed = -2;
      }

      $videoObject.pause();
      if (!this.backwardInterval) {
        this.backwardInterval = setInterval(this.backwardIntervalFunc, 250);
      }
      this.setState({ paused: false, backward: true, forward: false, speed });
      this.sendScreenInfo();
    }
  }

  render() {
    const {
      paused, disabled, progress, duration, elapsedTime, speed, forward, backward,
    } = this.state;
    const { video, clip, onClipIndicatorClick } = this.props;

    let speedIcon = 'glyphicon-play';
    if (forward) speedIcon = 'glyphicon-forward';
    if (backward) speedIcon = 'glyphicon-backward';

    let fragment = '';
    if (clip) {
      fragment += `#t=${libHelper.toHHMMSS(clip.start, true)}`;
      if (clip.end > clip.start) {
        fragment += `,${libHelper.toHHMMSS(clip.end, true)}`;
      }
    }
    return (
      <div className="video-player">
        <div className="video-player__video">
          <div onClick={this.togglePause}>
            <span
              ref="visibleInfo"
              className="video-player__video-speed"
              style={{ display: 'none' }}
            >
              <i className={`glyphicon ${speedIcon}`} /> x{speed}.0
            </span>
            <div>
              <video ref="videoObject">
                {video ? (
                  <source src={`${video.fileUrl}${fragment}`} />
                ) : null}
              </video>
            </div>
          </div>
        </div>

        <div className="video-player__progress">
          <span className="video-player__progress-indicator" style={{ left: `${progress}%` }} />
          {video && !clip && video.clips ? video.clips.map(curClip => (
            <span
              key={curClip.id}
              data-id={curClip.id}
              className="video-player__clip-indicator"
              style={curClip.start ? { left: `${(curClip.start * 100) / duration}%` } : null}
              onClick={() => onClipIndicatorClick(curClip.id)}
            >
              <div></div>
            </span>
          )) : null}
        </div>

        <div className="video-player__controls">
          <span className="video-player__elapsed-time">{libHelper.toHHMMSS(elapsedTime)}</span>
          <button className="btn btn-icon" disabled={disabled} onClick={this.backward}>
            <i className="glyphicon glyphicon-backward" />
          </button>
          <button
            className="btn btn-icon"
            disabled={disabled}
            onClick={this.togglePause}
            title={paused ? 'Play' : 'Pause'}
          >
            <i className={`glyphicon ${paused ? 'glyphicon-play' : 'glyphicon-pause'}`} />
          </button>
          <button className="btn btn-icon" disabled={disabled} onClick={this.forward}>
            <i className="glyphicon glyphicon glyphicon-forward" />
          </button>
          <span className="video-player__left-time">{libHelper.toHHMMSS(duration)}</span>
        </div>
      </div>
    );
  }
}

VideoPlayer.defaultProps = {
  autoPlay: false,
};

VideoPlayer.propTypes = {
  video: PropTypes.object,
  clip: PropTypes.object,
  onLoaded: PropTypes.func,
  autoPlay: PropTypes.bool,
  onClipEnds: PropTypes.func,
  onClipIndicatorClick: PropTypes.func.isRequired,
};

export default VideoPlayer;
