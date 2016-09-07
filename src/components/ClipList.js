import React, { Component, PropTypes } from 'react';
import ClipItem from './ClipItem';

class ClipList extends Component {
  constructor(props) {
    super(props);
    this.state = { clips: [] };
    this.clipIds = 0;

    this.onClipDelete = this.onClipDelete.bind(this);
    this.createClip = this.createClip.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { clips } = this.state;
    if (clips && nextProps.video && nextProps.video.clips) {
      const isSame = (clips.length === nextProps.video.clips.length)
        && clips.every((element, index) => element === nextProps.video.clips[index]);

      if (!isSame) this.setState({ clips: nextProps.video.clips });
    } else {
      this.setState({ clips: nextProps.clips || [] });
    }
  }

  onClipDelete(clipId) {
    const { onClipChange } = this.props;
    onClipChange(clipId, true);
  }

  createClip() {
    this.clipIds++;
    const { clips } = this.state;
    clips.push({
      id: this.clipIds,
      name: `Clip ${this.clipIds}`,
    });
    this.setState(clips);
  }

  render() {
    const {
      video, onClipChange, onAddClip, onPlayClick, playingClip, isPlaying, editableOptions,
    } = this.props;
    const { clips } = this.state;
    return (
      <div className="clip-list">
        <header className="clip-list__header">
          <h3 className="clip-list__title">Videoclips List</h3>
          <ul className="button-set">
            {onAddClip && editableOptions ? (
              <li>
                <button
                  className="btn btn-icon"
                  title="Create new clip"
                  onClick={() => onAddClip(null, true)}
                >
                  <i className="glyphicon glyphicon-plus" />
                </button>
              </li>
            ) : null}
          </ul>
        </header>
        <div className="clip-list__body">
          <ul>
            <li className="clip-list__video">
              <span className="clip-list__video-name">
                <i className="fa fa-video-camera" /> <span>{video.name}</span>

                <ul className="button-set">
                  <li>
                    <button
                      title="Play"
                      className="btn btn-icon btn-small"
                      onClick={() => onPlayClick(null, !isPlaying)}
                    >
                      {isPlaying && !playingClip ? (
                        <i className="glyphicon glyphicon-stop" />
                      ) : (
                        <i className="glyphicon glyphicon-play" />
                      )}
                    </button>
                  </li>
                </ul>
              </span>
              <ul className="clip-list__video-clips">
                {clips.map(
                  clip => (
                    <ClipItem
                      key={clip.id}
                      clip={clip}
                      onDelete={editableOptions ? this.onClipDelete : null}
                      onEdit={editableOptions ? onClipChange : null}
                      onPlay={onPlayClick}
                      playing={isPlaying && playingClip ? playingClip.id === clip.id : false}
                    />
                  )
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

ClipList.defaultProps = {
  isPlaying: false,
  editableOptions: true,
};

ClipList.propTypes = {
  video: PropTypes.object,
  onClipChange: PropTypes.func,
  onPlayClick: PropTypes.func,
  onAddClip: PropTypes.func,
  playingClip: PropTypes.object,
  isPlaying: PropTypes.bool,
  editableOptions: PropTypes.bool,
};

export default ClipList;
