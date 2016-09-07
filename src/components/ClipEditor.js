import React, { Component, PropTypes } from 'react';
import libHelper from '../lib/helpers';
import Draggabilly from 'draggabilly';
import TagControl from './TagControl';

class ClipEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { videoCurrentTime: 0, clip: null, clipStart: '', clipEnd: '' };

    this.onVideoTimeUpdate = this.onVideoTimeUpdate.bind(this);
    this.onDurationInputChange = this.onDurationInputChange.bind(this);
    this.onClipFormSubmit = this.onClipFormSubmit.bind(this);

    this.renderForm = this.renderForm.bind(this);
    this.renderTimeRuleFragments = this.renderTimeRuleFragments.bind(this);

    this.setClipRange = this.setClipRange.bind(this);
    this.setRangeControlsByClip = this.setRangeControlsByClip.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { clip } = nextProps;
    if (!libHelper.compareObjects(this.state.clip, clip)) {
      let clipStart = '';
      let clipEnd = '';
      if (clip) {
        if (clip.start) {
          clipStart = clip.start;
        } else {
          clipStart = 0;
        }
        if (clip.end) {
          clipEnd = clip.end;
        } else {
          clipEnd = this.props.videoElem ? this.props.videoElem.duration : '';
        }
      }
      this.setState({ clip, clipStart, clipEnd });

      if (!libHelper.compareObjects(this.state.clip, clip)) this.setRangeControlsByClip(clip);
    }
  }

  componentDidUpdate() {
    const { videoElem } = this.props;
    if (videoElem && !this.editorLoaded) {
      this.editorLoaded = true;
      const { dragCurrentTime } = this.refs;
      const dct = new Draggabilly(dragCurrentTime, {
        axis: 'x',
        containment: '.clip-editor__current-time',
      });
      dct.on('dragMove', () => {
        const currentTime = (dct.position.x / 80) * 2;
        this.setState({ videoCurrentTime: currentTime });
        videoElem.currentTime = currentTime;
      });
      videoElem.addEventListener('timeupdate', this.onVideoTimeUpdate);
      this.editorTimeControl = dct;

      const clipRangeControls = document.getElementsByClassName('clip-editor__clip-range-control');
      if (clipRangeControls.length === 2) {
        const arrDcc = [];
        for (let i = 0; i < 2; i++) {
          const dcc = new Draggabilly(clipRangeControls[i], {
            axis: 'x',
            containment: '.clip-editor__clip-range',
          });
          dcc.on('dragMove', () => {
            const cr1 = (this.clipRangesDraggabilly[0].position.x / 40);
            const cr2 = (this.clipRangesDraggabilly[1].position.x / 40);
            const clipStart = cr1 < cr2 ? cr1 : cr2;
            const clipEnd = cr2 > cr1 ? cr2 : cr1;
            this.setState({ clipStart, clipEnd });
          });
          arrDcc.push(dcc);
        }
        this.clipRangesDraggabilly = arrDcc;
      }
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onVideoTimeUpdate() {
    if (!this.unmounted) {
      const { videoElem } = this.props;
      const { dragCurrentTime } = this.refs;
      if (!dragCurrentTime.classList.contains('is-dragging')) {
        this.setState({ videoCurrentTime: videoElem.currentTime });
        dragCurrentTime.style.left = `${(videoElem.currentTime * 80) / 2}px`;
      }
    }
  }

  onDurationInputChange(value, end = false) {
    const { clip } = this.state;
    if (clip) {
      const clipRangeControls = document.getElementsByClassName('clip-editor__clip-range-control');
      let { clipStart, clipEnd } = this.state;
      if (end) {
        const { videoElem } = this.props;
        if (value > videoElem.duration) return;
        clipEnd = value;
        clip.end = value;
        clipRangeControls[1].style.left = `${value * 40}px`;
      } else {
        if (value < 0) return;
        clipStart = value;
        clip.start = value;
        clipRangeControls[0].style.left = `${value * 40}px`;
      }
      this.setState({ clip, clipStart, clipEnd });
    }
  }

  onClipFormSubmit(e) {
    e.preventDefault();
    const { onSaveClip } = this.props;
    const { clip } = this.state;
    const v1 = parseFloat(this.refs.start.value);
    const v2 = parseFloat(this.refs.end.value);
    clip.start = v1 < v2 ? v1 : v2;
    clip.end = v2 > v1 ? v2 : v1;
    clip.tags = this.refs.tagControl.getValue();
    onSaveClip(clip);
  }

  setClipRange(end = false) {
    const { videoElem } = this.props;
    const clipRangeControls = document.getElementsByClassName('clip-editor__clip-range-control');
    if (clipRangeControls.length === 2) {
      let rc1 = clipRangeControls[0].style.left || 0;
      rc1 = parseInt(rc1.toString().replace('px', ''), 10);
      let rc2 = clipRangeControls[1].style.left || (videoElem.duration * 40);
      rc2 = parseInt(rc2.toString().replace('px', ''), 10);

      let clip = null;
      if (end) {
        clip = rc1 < rc2 ? clipRangeControls[1] : clipRangeControls[0];
        this.setState({ clipEnd: this.editorTimeControl.position.x / 40 });
      } else {
        clip = rc1 > rc2 ? clipRangeControls[1] : clipRangeControls[0];
        this.setState({ clipStart: this.editorTimeControl.position.x / 40 });
      }
      clip.style.left = `${this.editorTimeControl.position.x}px`;
    }
  }

  setRangeControlsByClip(clip) {
    const clipRangeControls =
      document.getElementsByClassName('clip-editor__clip-range-control');
    const totalEnd = this.props.videoElem ? this.props.videoElem.duration * 40 : 0;
    if (clip) {
      clipRangeControls[0].style.left = clip.start ? `${clip.start * 40}px` : 0;
      clipRangeControls[1].style.left = clip.end ? `${clip.end * 40}px` : `${totalEnd}px`;
    } else {
      clipRangeControls[0].style.left = 0;
      clipRangeControls[1].style.left = `${totalEnd}px`;
    }
  }

  renderForm() {
    const { clip, onCancel } = this.props;
    const { clipStart, clipEnd } = this.state;
    return (
      <form className="clip-editor__info-form container-fluid" onSubmit={this.onClipFormSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label className={clip ? null : 'disabled'}>Start</label>
              <input
                ref="start"
                type="number"
                className="form-control"
                value={clipStart}
                onChange={(e) => this.onDurationInputChange(e.target.value)}
                disabled={!clip}
                step={0.1}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className={clip ? null : 'disabled'}>End</label>
              <input
                ref="end"
                type="number"
                className="form-control"
                value={clipEnd}
                onChange={(e) => this.onDurationInputChange(e.target.value, true)}
                disabled={!clip}
                step={0.1}
              />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <TagControl ref="tagControl" value={clip ? clip.tags : null} disabled={!clip} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <button
              type="button"
              className="btn btn-danger"
              disabled={!clip}
              onClick={onCancel}
            >
              Cancel edition
            </button>
            <button className="btn btn-default pull-right" disabled={!clip}>Save clip</button>
          </div>
        </div>
      </form>
    );
  }

  renderTimeRuleFragments(duration) {
    const totalFragments = Math.ceil(duration / 2);
    const timeFragments = [];
    for (let i = 0; i < totalFragments; i++) {
      timeFragments.push((<li key={i}>
        <span>{libHelper.toHHMMSS(i * 2)}</span>
        <ul className="clip-editor__time-rule__marks">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </li>));
    }
    return timeFragments;
  }

  render() {
    const { video, clip, videoElem } = this.props;
    const { videoCurrentTime } = this.state;
    const clipWithStyle = videoElem && videoElem.duration ?
    { width: (80 * videoElem.duration) / 2 } : null;
    return (
      <div className="clip-editor">
        <div className="clip-editor__info">
          <header className="clip-editor__info-header">
            {clip ? clip.name : 'No clip loaded'}
          </header>
          {this.renderForm()}
        </div>
        <div className={`clip-editor__timeline ${!clip ? 'disabled' : ''}`}>
          <div>
            <div className="clip-editor__time-rule">
              <ul>
                {videoElem ? this.renderTimeRuleFragments(videoElem.duration) : null}
              </ul>
            </div>
            <div className="clip-editor__thumbs-timelien">
              <ul style={{ backgroundImage: `url('${video.thumbs}')` }}>
              </ul>
            </div>

            <div className="clip-editor__clip-range" style={clipWithStyle}>
              <div className="clip-editor__clip-range-control"></div>
              <div className="clip-editor__clip-range-control"></div>
            </div>

            <div className="clip-editor__current-time" style={clipWithStyle}>
              <div ref="dragCurrentTime" className="clip-editor__current-time__indicator">
                <div className="clip-editor__current-time__controls">
                  <span className="controls">
                    <i
                      className="circle-control fa fa-circle"
                      title="Set clip start"
                      onClick={() => this.setClipRange()}
                    />
                    <i
                      className="circle-control fa fa-circle"
                      title="Set clip end"
                      onClick={() => this.setClipRange(true)}
                    />
                  </span>
                  <span>{libHelper.toHHMMSS(videoCurrentTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ClipEditor.propTypes = {
  video: PropTypes.object,
  clip: PropTypes.object,
  videoElem: PropTypes.object,
  onSaveClip: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ClipEditor;
