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
    // add new encounter to list
    console.log(encounters);
    setEncounters(prev => {
      console.log(prev);
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

  function getProgress() {
    return ((encounters.clicks / encounters.odds) * 100) + "%";
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
    var c = encounters.clicks.toString()
    if (c.length > 2) {
      if (c.split('6').join('').length === 0) {
        return "red"
      } else if (c.split('7').join('').length === 0) {
        return "green"
      } else if (c.split('3').join('').length === 0) {
        return "pink"
      } else if (c.substring(1).split('0').join('').length === 0) {
        return "steelblue"
      } else if (c.split(c[0]).join('').length === 0) {
        return "goldenrod"
      }
    }
    if (c === Math.ceil(encounters.odds)) {
      return "purple"
    }
    return "black"
  }

  return (
    <div className="app" tabIndex='0' onKeyDown={addEncounter}>
      <div className="count" onClick={setClicks} style={{color: getStyle()}}>
        {encounters.clicks}
      </div>
      <div className="bar">
        <div className="progress" style={{width: getProgress()}}></div>
      </div>
      <div className="session">
        <div className="sessioncount">
          {encounters.stamps.length} this session
        </div>
        <div className="sessionodds" onClick={setOdds}>
          {encounters.odds}
        </div>
      </div>
      <div className="stats" onClick={addEncounter}>
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
