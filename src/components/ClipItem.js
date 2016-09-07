import React, { Component, PropTypes } from 'react';
import swal from 'sweetalert';

class ClipItem extends Component {
  constructor(props) {
    super(props);
    const { clip } = this.props;
    this.state = { editing: clip.isNew, error: null, clip };

    this.onChangeName = this.onChangeName.bind(this);
    this.onLabelNameClick = this.onLabelNameClick.bind(this);
    this.onNameInputKeyUp = this.onNameInputKeyUp.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);

    this.completeEdit = this.completeEdit.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.editClick = this.editClick.bind(this);
    this.playClick = this.playClick.bind(this);
  }

  componentDidMount() {
    const { nameInput } = this.refs;
    const { clip } = this.state;
    if (clip.isNew) nameInput.select();
  }

  componentDidUpdate() {
    if (this.setFocus) {
      this.setFocus = false;
      const { nameInput } = this.refs;
      nameInput.select();
    }
  }

  onChangeName(e) {
    const { clip } = this.state;
    clip.name = e.target.value;
    this.setState({ clip });
  }

  onNameInputKeyUp(e) {
    if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
      this.completeEdit();
    }
  }

  onLabelNameClick() {
    this.setFocus = true;
    this.setState({ editing: true });
  }

  onDeleteClick() {
    swal(
      {
        title: 'Are you sure?',
        text: 'You will not be able to recover this clip!',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, delete it!',
        closeOnConfirm: true,
        allowOutsideClick: true,
      }, this.deleteClick);
  }

  deleteClick() {
    const { onDelete } = this.props;
    const { clip } = this.state;
    onDelete(clip.id);
  }

  editClick() {
    const { onEdit } = this.props;
    const { clip } = this.state;
    onEdit(clip);
  }

  playClick() {
    const { onPlay, clip, playing } = this.props;
    onPlay(clip, !playing);
  }

  completeEdit() {
    const { onEdit } = this.props;
    const { clip } = this.state;
    if (clip.name) {
      this.setState({ editing: false, error: null });
      if (clip.isNew) {
        delete clip.isNew;
      }
      onEdit(clip);
    } else {
      this.setState({ error: 'The clip must have a name' });
    }
  }

  render() {
    const { editing, clip, error } = this.state;
    const { onEdit, onDelete, onPlay, playing } = this.props;
    return (
      <li className="clip-list__clip">
        <span className="clip-list__clip-name">
          <i className="fa fa-film" />
          <span
            style={{ display: editing ? 'none' : 'inline-block' }}
            onClick={this.onLabelNameClick}
          >
            {clip.name}
          </span>
          <input
            ref="nameInput"
            className={`form-control ${error ? 'has-error' : ''}`}
            value={clip.name}
            style={{ display: editing ? 'inline-block' : 'none' }}
            onChange={this.onChangeName}
            onBlur={this.completeEdit}
            onKeyUp={this.onNameInputKeyUp}
          />
          {error ? (<i className="glyphicon glyphicon-remove" title={error} />) : null}
        </span>

        <ul className="button-set">
          {onEdit ? (
            <li>
              <button
                className="btn btn-icon btn-small"
                title="Load on the editor"
                onClick={this.editClick}
              >
                <i className="glyphicon glyphicon-pencil" />
              </button>
            </li>
          ) : null}

          {onDelete ? (
            <li>
              <button
                className="btn btn-icon btn-small"
                title="Delete Clip"
                onClick={this.onDeleteClick}
              >
                <i className="glyphicon glyphicon-remove" />
              </button>
            </li>
          ) : null}

          {onPlay ? (
            <li>
              <button className="btn btn-icon btn-small" title="Play Clip" onClick={this.playClick}>
                {playing ? (
                  <i className="glyphicon glyphicon-stop" />
                ) : (
                  <i className="glyphicon glyphicon-play" />
                )}
              </button>
            </li>
          ) : null}
        </ul>
      </li>
    );
  }
}

ClipItem.defaultProps = {
  playing: false,
};

ClipItem.propTypes = {
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onPlay: PropTypes.func,
  clip: PropTypes.object.isRequired,
  playing: PropTypes.bool,
};

export default ClipItem;
