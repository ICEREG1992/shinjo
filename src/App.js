import './App.css';
import React, { useState, useEffect } from 'react';
import humanizeDuration from 'humanize-duration';

const localStorageKey = 'shinjo.data';

function App() {
  const [encounters, setEncounters] = useState({clicks: 0, stamps: [], odds: 8192});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(localStorageKey));
    if (data) {
      setEncounters({clicks: data[0], stamps: [], odds: data[1]});
    }
  }, [])

  // save encounters to local storage
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify([encounters.clicks, encounters.odds]));
  }, [encounters])

  function addEncounter(e) {
    switch (e.key) {
      case 'Alt':
      case 'Tab':
      case 'Meta':
      case 'ContextMenu':
      case 'Escape':
        return;
      case 'Enter':
        switch (e.target){
          case document.getElementsByClassName('count')[0]:
            setClicks();
            break;
          case document.getElementsByClassName('sessionodds')[0]:
            setOdds();
            break;
          case document.getElementsByClassName('stats')[0]:
            break;
          default:
            break;
        }
        break;
      default: break;
    }
    // add new encounter to list
    setEncounters(prev => {
      return {clicks: prev.clicks + 1, stamps: [...(prev.stamps), Date.now()], odds: prev.odds};
    })
  }

  function getAverageWait() {
    if (encounters.stamps.length < 2) {
      return 60000
    }
    let prev = 0;
    let avg = 0;
    encounters.stamps.forEach(element => {
      if (prev !== 0) {
        avg += element - prev;
      }
      prev = element;
    });
    return (avg / (encounters.stamps.length - 1))
  }

  function getOdds() {
    var a = 1/encounters.odds;
    var b = encounters.clicks;
    var c = Math.pow(1 - a, b);
    return 100 * (c * Math.pow( - (1 / (a - 1)), b) - c)
  }

  function getProgress(i) {
    return (Math.min(35, ((encounters.clicks / encounters.odds) * 35) - (35 * i))) + "em";
  }

  function getRemainingEncounters() {
    var a = 1/encounters.odds;
    var b = Math.ceil(Math.log(0.1) / Math.log(1 - a));
    return b - encounters.clicks;
  }

  function getRemainingTime() {
    return (Math.ceil(encounters.odds)-encounters.clicks) * getAverageWait();
  }

  function setClicks() {
    var n = prompt("enter number of encounters to set (this will reset your current session)");
    n = parseInt(n);
    if (!isNaN(n)) {
      setEncounters({clicks: n, stamps: [], odds: encounters.odds});
    }
  }

  function setOdds() {
    var n = prompt("enter a denominator value for your shiny odds (e.g. 8192 for full odds)");
    n = parseFloat(n);
    if (!isNaN(n)) {
      setEncounters({clicks: encounters.clicks, stamps: encounters.stamps, odds: n});
    }
  }

  function getStyle() {
    var c = encounters.clicks.toString();
    if (c.length > 2) {
      if (isSequential(c)) {
        return "grey";
      } else if (c.split('6').join('').length === 0) {
        return "red";
      } else if (c.split('7').join('').length === 0) {
        return "green";
      } else if (c.split('3').join('').length === 0) {
        return "pink";
      } else if (c.substring(1).split('0').join('').length === 0) {
        return "steelblue";
      } else if (c.split(c[0]).join('').length === 0) {
        return "goldenrod";
      }
    }
    if (c === (Math.ceil(encounters.odds)).toString()) {
      return "purple";
    }
    switch (c) {
      case '8008': return "mistyrose";
      case '1337': return "lime";
      case '404': return "maroon";
      default: break;
    }
    return "black";
  }

  // this function sucks
  function isSequential(s) {
    var a = parseInt(s[0]), b = parseInt(s[1]);
    var ascending;
    var c = 1
    if (a < b) {
      ascending = true;
      c = b - a;
    } else if (a > b) {
      ascending = false;
      c = a - b;
    } else {
      return false;
    }
    // return if not interesting cases
    if (ascending) {
      if (c === 2 && s.length === 3 && (a === 1 || a > 4)) { // cut 135, 468, 579
        return false;
      }
      if (c === 3 && a < 3) { // cut 147, 258
        return false;
      }
      if (c > 3) {
        return false;
      }
    } else {
      if (c === 1 && s.length === 3 && (a !== 3)) { // cut 210, 432, 543, 654, 765, 876, 987
        return false;
      }
      if (c === 2 && s.length === 3) { // cut 420, 531, 642, 753, 864, 975
        return false;
      }
      if (c === 2 && s.length === 4 && (a === 6 || a === 9)) { // cut 6420, 9753
        return false;
      }
      if (c <= 3) { // cut 630, 741, 852, 963, 9630
        return false;
      }
    }
    if ((c === 3 && a < 3) || (s.length === 3 && c === 2)) { return false }
    var flag = true;
    if (ascending) {
      for (var i = 1; i < s.length; i++) {
        if (parseInt(s[i]) > a && parseInt(s[i]) - a === c) {
          a = parseInt(s[i]);
        } else {
          flag = false;
          break;
        }
      }
    } else {
      for (i = 1; i < s.length; i++) {
        if (parseInt(s[i]) < a && a - parseInt(s[i]) === c) {
          a = parseInt(s[i]);
        } else {
          flag = false;
          break;
        }
      }
    }
    return flag;
  }

  function Progress() {
    var out = [];
    for (var i = 0; i < Math.ceil(encounters.clicks / encounters.odds); i++) {
      out.push(<div className="progress" style={{width: getProgress(i)}}></div>);
    }
    return out;
  }

  return (
    <div className="app" tabIndex='0' onKeyDown={addEncounter}>
      <div className="count" onClick={setClicks} style={{color: getStyle()}} tabIndex={0} onSubmit={setClicks}>
        {encounters.clicks}
      </div>
      <div className="bar">
        <Progress />
        {/* <div className="progress" style={{width: getProgress()}}></div> */}
      </div>
      <div className="session">
        <div className="sessioncount">
          {encounters.stamps.length} this session
        </div>
        <div className="sessionodds" onClick={setOdds} tabIndex={0}>
          {encounters.odds}
        </div>
      </div>
      <div className="stats" onClick={addEncounter} tabIndex={0}>
        <div className="rate">
          <div className="avg">avg. {humanizeDuration(getAverageWait(), { maxDecimalPoints: 2 })} run time</div>
          <div className="remaining">expected {humanizeDuration(getRemainingTime(), { largest: 2, maxDecimalPoints: 0, units: ["h","m"] })} until {Math.ceil(encounters.odds)}</div>
        </div>
        <div className="chance">
          <div className="odds">{getOdds().toFixed(2)}% odds to have caught by now</div>
          <div className="remaining">{getRemainingEncounters()} encounters until 90% odds</div>
        </div>
      </div>
    </div>
  );
}

export default App;
