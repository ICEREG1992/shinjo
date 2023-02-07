import './App.css';
import React, { useState, useEffect } from 'react';
import humanizeDuration from 'humanize-duration';

const localStorageKey = 'shinjo.data';

function App() {
  const [encounters, setEncounters] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(localStorageKey));
    if (data) {
      setEncounters(data);
    }
  }, [])

  // save encounters to local storage
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(encounters));
  }, [encounters])

  function addEncounter(e) {
    // add new encounter to list
    setEncounters(prev => {
      return [...prev, Date.now()]
    })
  }

  function getAverageWait() {
    if (encounters.length === 0) {
      return 0
    }
    let prev = 0;
    let avg = 0;
    encounters.forEach(element => {
      if (prev !== 0) {
        avg += element - prev;
      }
      prev = element;
    });
    return (avg / (encounters.length - 1))
  }

  function getOdds() {
    var a = 1/8192;
    var b = encounters.length;
    var c = Math.pow(1 - a, b);
    return 100 * (c * Math.pow( - (1 / (a - 1)), b) - c)
  }

  function getRemainingEncounters() {
    var a = 1/8192;
    var b = Math.ceil(Math.log(0.1) / Math.log(1 - a));
    return b - encounters.length;
  }

  function getRemainingTime() {
    return getRemainingEncounters() * getAverageWait();
  }

  return (
    <div className="app" tabIndex='0' onKeyDown={addEncounter}>
      <div className="count">
        {encounters.length}
      </div>
      <div className="stats">
        <div className="rate">
          <div className="avg">avg. {humanizeDuration(getAverageWait(), { maxDecimalPoints: 2 })}</div>
          <div className="remaining">expected {humanizeDuration(getRemainingTime(), { largest: 2, maxDecimalPoints: 2 })} remaining</div>
        </div>
        <div className="chance">
          <div className="odds">{getOdds().toFixed(2)}%</div>
          <div className="remaining">{getRemainingEncounters()} encounters remaining</div>
        </div>
      </div>
    </div>
  );
}

export default App;
