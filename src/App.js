import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from "react-transition-group";
import humanizeDuration from 'humanize-duration';

const localStorageKey = 'shinjo.data';

function App() {
  const [pageData, setPageData] = useState({clicks: 0, stamps: [], odds: 8192, darkmode: 0});
  const [gearState, setGearState] = useState(false)
  const [modalState, setModalState] = useState(false)
  const gearRef = useRef(null)
  const modalRef = useRef(null)

  // trigger once on page load
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(localStorageKey));
    if (data) {
      setPageData({clicks: data[0], stamps: [], odds: data[1], darkmode: data[2]});
    }
  }, [])

  // save pageData to local storage
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify([pageData.clicks, pageData.odds, pageData.darkmode]));
  }, [pageData])

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
    setPageData(prev => {
      return {clicks: prev.clicks + 1, stamps: [...(prev.stamps), Date.now()], odds: prev.odds, darkmode: prev.darkmode};
    })
  }

  function getAverageWait() {
    if (pageData.stamps.length < 2) {
      return 60000
    }
    let prev = 0;
    let avg = 0;
    pageData.stamps.forEach(element => {
      if (prev !== 0) {
        avg += element - prev;
      }
      prev = element;
    });
    return (avg / (pageData.stamps.length - 1))
  }

  function getOdds() {
    var a = 1/pageData.odds;
    var b = pageData.clicks;
    var c = Math.pow(1 - a, b);
    return 100 * (c * Math.pow( - (1 / (a - 1)), b) - c)
  }

  function getProgress(i) {
    return (Math.min(35, ((pageData.clicks / pageData.odds) * 35) - (35 * i))) + "em";
  }

  function getRemainingEncounters() {
    var a = 1/pageData.odds;
    var b = Math.ceil(Math.log(0.1) / Math.log(1 - a));
    return b - pageData.clicks;
  }

  function getRemainingTime() {
    return (Math.ceil(pageData.odds)-pageData.clicks) * getAverageWait();
  }

  function setClicks() {
    var n = prompt("enter number of encounters to set (this will reset your current session)");
    n = parseInt(n);
    if (!isNaN(n)) {
      setPageData({clicks: n, stamps: [], odds: pageData.odds, darkmode: pageData.darkmode});
    }
  }

  function setOdds() {
    var n = prompt("enter a denominator value for your shiny odds (e.g. 8192 for full odds)");
    n = parseFloat(n);
    if (!isNaN(n)) {
      setPageData({clicks: pageData.clicks, stamps: pageData.stamps, odds: n, darkmode: pageData.darkmode});
    }
  }

  function getStyle() {
    var c = pageData.clicks.toString();
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
    if (c === (Math.ceil(pageData.odds)).toString()) {
      return "purple";
    }
    switch (c) {
      case '8008': return "mistyrose";
      case '1337': return "lime";
      case '1312': return "navy";
      case '2023': return "orange";
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
    for (var i = 0; i < Math.ceil(pageData.clicks / pageData.odds); i++) {
      out.push(<div className="progress" style={{width: getProgress(i)}}></div>);
    }
    return out;
  }

  function Gear() {
    var svg;
    if (pageData.darkmode) {
      svg = <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
      </svg>
    } else {
      svg = <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
      </svg>
    }
    return (<div className="gear" onClick={toggleModal} ref={gearRef}>{svg}</div>)
  }

  function Modal() {
    return (<div className={"modal"} ref={modalRef}>
        <div>test</div>
        <div>test2</div>
      </div>)
  }

  function showOptions() {
    setGearState(true);
  }

  function hideOptions() {
    setGearState(false);
  }

  function toggleModal() {
    setModalState(prev=> { return !prev });
  }

  return (
    <div className="app" tabIndex='0' onKeyDown={addEncounter}>
      <div className="count" onClick={setClicks} style={{color: getStyle()}} tabIndex={0} onSubmit={setClicks}>
        {pageData.clicks}
      </div>
      <div className="bar">
        <Progress />
        {/* <div className="progress" style={{width: getProgress()}}></div> */}
      </div>
      <div className="session">
        <div className="sessioncount">
          {pageData.stamps.length} this session
        </div>
        <div className="sessionodds" onClick={setOdds} tabIndex={0}>
          {pageData.odds}
        </div>
      </div>
      <div className="stats" onClick={addEncounter} tabIndex={0}>
        <div className="rate">
          <div className="avg">avg. {humanizeDuration(getAverageWait(), { maxDecimalPoints: 2 })} run time</div>
          <div className="remaining">expected {humanizeDuration(getRemainingTime(), { largest: 2, maxDecimalPoints: 0, units: ["h","m"] })} until {Math.ceil(pageData.odds)}</div>
        </div>
        <div className="chance">
          <div className="odds">{getOdds().toFixed(2)}% odds to have caught by now</div>
          <div className="remaining">{getRemainingEncounters()} encounters until 90% odds</div>
        </div>
      </div>
      <div className="options" onMouseEnter={showOptions} onMouseLeave={hideOptions}>
        <CSSTransition nodeRef={gearRef} in={gearState} timeout={200} classNames="gear-transition" unmountOnExit>
          <Gear/>
        </CSSTransition>
      </div>
      <CSSTransition nodeRef={modalRef} in={modalState} timeout={200} classNames="modal-transition" unmountOnExit>
        <Modal/>
      </CSSTransition>
    </div>
  );
}

export default App;
