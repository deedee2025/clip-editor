export default {
  toHHMMSS(sec, getHours = false) {
    const secNum = parseFloat(sec, 10);
    let hours = Math.floor((secNum / 60) / 60);
    let minutes = Math.floor((secNum - (hours * 60 * 60)) / 60);
    let seconds = Math.floor(secNum - (minutes * 60));
    let milliseconds = (secNum - (minutes * 60) - seconds) * 100;

    if (hours < 10) {
      hours = `0${hours}`;
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    if (milliseconds < 10) {
      milliseconds = `0${milliseconds.toString().substr(0, 1)}`;
    } else {
      milliseconds = milliseconds.toString().substr(0, 2);
    }

    return `${getHours ? `${hours}:` : ''}${minutes}:${seconds}.${milliseconds}`;
  },

  compareObjects(obj1, obj2) {
    if ((obj1 === null || obj1 === 'undefined')
      && (obj2 === null || obj2 === 'undefined')) return true;

    if ((obj1 === null || obj1 === 'undefined')
      && (obj2 !== null || obj2 !== 'undefined')) return false;

    if ((obj1 !== null || obj1 !== 'undefined')
      && (obj2 === null || obj2 === 'undefined')) return false;

    // eslint-disable-next-line
    for (const p in obj1) {
      if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

      switch (typeof (obj1[p])) {
        case 'function':
          if (typeof (obj2[p]) === 'undefined' || (p !== 'compare'
            && obj1[p].toString() !== obj2[p].toString())) return false;
          break;
        default:
          if (obj1[p] !== obj2[p]) return false;
      }
    }

    // eslint-disable-next-line
    for (const p in obj2) {
      if (typeof (obj1[p]) === 'undefined') return false;
    }
    return true;
  },
};
