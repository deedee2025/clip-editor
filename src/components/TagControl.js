import React, { Component, PropTypes } from 'react';

class TagControl extends Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = { tags: value || [] };

    this.onControlClick = this.onControlClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);

    this.getValue = this.getValue.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    if (value !== this.props.value) {
      this.setState({ tags: value || [] });
    }
  }

  onControlClick(e) {
    if (e.target.classList.contains('tab-control')) {
      this.refs.txtInput.focus();
    }
  }

  onKeyDown(e) {
    const { tags } = this.state;
    const { txtInput } = this.refs;
    if ((e.which && e.which === 8) || (e.keyCode && e.keyCode === 8)) {
      const tagText = txtInput.innerHTML.replace(new RegExp(' ', 'g'), '');
      if (!tagText) {
        tags.pop();
        this.setState({ tags });
      }
    }
  }

  onKeyPress(e) {
    if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
      e.preventDefault();
      const { tags } = this.state;
      const { txtInput } = this.refs;
      const tagText = txtInput.innerHTML.replace(new RegExp(' ', 'g'), '');
      if (tags.indexOf(tagText) < 0) {
        txtInput.innerHTML = '';
        tags.push(tagText);
        this.setState({ tags });
      }
    }
  }

  onDeleteClick(e) {
    const { tags } = this.state;
    const indx = parseInt(e.target.getAttribute('data-tag'), 10);
    tags.splice(indx, 1);
    this.setState({ tags });
  }

  getValue() {
    return this.state.tags;
  }

  render() {
    const { tags } = this.state;
    const { disabled } = this.props;
    return (
      <div className="form-group">
        <label className={disabled ? 'disabled' : null}>Tags</label>
        <div
          className={`form-control tab-control ${disabled ? 'disabled' : ''}`}
          onClick={disabled ? null : this.onControlClick}
        >
          {tags.map((tag, i) => (
            <span key={i} className="tab-control__tag">
              {tag} <i onClick={this.onDeleteClick} data-tag={i}>&times;</i>
            </span>
          ))}
          <span
            ref="txtInput"
            className="tab-control__input"
            contentEditable
            onKeyDown={this.onKeyDown}
            onKeyPress={this.onKeyPress}
          />
        </div>
      </div>
    );
  }
}

TagControl.propTypes = {
  disabled: false,
};

TagControl.propTypes = {
  value: PropTypes.array,
  disabled: PropTypes.bool,
};

export default TagControl;
