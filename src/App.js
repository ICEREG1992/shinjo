import './App.css';
import React, { useState, useEffect } from 'react';
import humanizeDuration from 'humanize-duration';

const localStorageKey = 'shinjo.data';

function App() {
  const [encounters, setEncounters] = useState({clicks: 0, stamps: []});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(localStorageKey));
    if (data) {
      setEncounters({clicks: data, stamps: []});
    }
  }, [])

  // save encounters to local storage
  useEffect(() => {
    localStorage.setItem(localStorageKey, encounters.clicks);
  }, [encounters])

  function addEncounter(e) {
    // add new encounter to list
    console.log(encounters);
    setEncounters(prev => {
      console.log(prev);
      return {clicks: prev.clicks + 1, stamps: [...(prev.stamps), Date.now()]};
    })
  }

  function getAverageWait() {
    if (encounters.stamps.length === 0) {
      return 0
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
    var a = 1/8192;
    var b = encounters.clicks;
    var c = Math.pow(1 - a, b);
    return 100 * (c * Math.pow( - (1 / (a - 1)), b) - c)
  }

  function getProgress() {
    return ((encounters.clicks / 8192) * 35) + "em";
  }

  function getRemainingEncounters() {
    var a = 1/8192;
    var b = Math.ceil(Math.log(0.1) / Math.log(1 - a));
    return b - encounters.clicks;
  }

  function getRemainingTime() {
    return getRemainingEncounters() * getAverageWait();
  }

  function setClicks() {
    var n = prompt("enter number of encounters to set (this will wipe your average encounter time)");
    n = parseInt(n);
    if (!isNaN(n)) {
      setEncounters({clicks: n, stamps: []});
    }
  }

  return (
    <div className="app" tabIndex='0' onKeyDown={addEncounter}>
      <div className="count" onClick={setClicks}>
        {encounters.clicks}
      </div>
      <div className="bar">
        <div className="progress" style={{width: getProgress()}}></div>
      </div>
      <div className="session">
        {encounters.stamps.length}
      </div>
      <div className="stats" onClick={addEncounter}>
        <div className="rate">
          <div className="avg">avg. {humanizeDuration(getAverageWait(), { maxDecimalPoints: 2 })} run time</div>
          <div className="remaining">expected {humanizeDuration(getRemainingTime(), { largest: 2, maxDecimalPoints: 0, units: ["h","m"] })} remaining</div>
        </div>
        <div className="chance">
          <div className="odds">{getOdds().toFixed(2)}% odds to have caught by now</div>
          <div className="remaining">{getRemainingEncounters()} encounters for 90% odds</div>
        </div>
      </div>
    </div>
  );
}

export default App;
