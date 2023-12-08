import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from "react-transition-group";
import humanizeDuration from 'humanize-duration';

const localStorageKey = 'shinjo.data';

function App() {
  const [pageData, setPageData] = useState({clicks: 0, stamps: [], odds: 8192, darkmode: 0, widget: 0});
  const [pageState, setPageState] = useState([false, false])
  const gearRef = useRef(null)
  const modalRef = useRef(null)

  // trigger once on page load
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(localStorageKey));
    if (data) {
      setPageData({clicks: data[0], stamps: [], odds: data[1], darkmode: data[2], widget: data[3]});
    }
  }, [])

  // save pageData to local storage
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify([pageData.clicks, pageData.odds, pageData.darkmode, pageData.widget]));
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
      return {clicks: prev.clicks + 1, stamps: [...(prev.stamps), Date.now()], odds: prev.odds, darkmode: prev.darkmode, widget: prev.widget};
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
      setPageData({clicks: n, stamps: [], odds: pageData.odds, darkmode: pageData.darkmode, widget: pageData.widget});
    }
  }

  function setOdds() {
    var n = prompt("enter a denominator value for your shiny odds (e.g. 8192 for full odds)");
    n = parseFloat(n);
    if (!isNaN(n)) {
      setPageData({clicks: pageData.clicks, stamps: pageData.stamps, odds: n, darkmode: pageData.darkmode, widget: pageData.widget});
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
      case '1492': return "lightseagreen";
      case '1984': return "darkred"
      case '2023': return "orange";
      case '404': return "maroon";
      default: break;
    }
    return pageData.darkmode ? "aliceblue": "black";
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
    for (var i = 0; i < Math.ceil(pageData.clicks / pageData.odds)-1; i++) {
      out.push(<div className="progress" style={{width: 'min(35em, 81%)'}}></div>);
    }
    out.push(<div className="progress" style={{width: (((pageData.clicks / pageData.odds)-i)*100) + "%", position: "relative"}}></div>);
    return out;
  }

  function Gear() {
    var svg;
    if (!pageState[1]) {
      svg = <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
      </svg>
    } else {
      svg = <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
      </svg>
    }
    return (<div className={"gear" + (pageData.darkmode ? " dark" : "")} onClick={toggleModal} ref={gearRef}>{svg}</div>)
  }

  function showGear() {
    if (!pageState[1]) {
      setPageState([true, pageState[1]]);
    }
  }

  function hideGear() {
    if (!pageState[1]) {
      setPageState([false, pageState[1]]);
    }
  }

  function Modal() {
    var moonsvg;
    if (pageData.darkmode) {
      moonsvg = <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="currentColor" className="bi bi-moon-fill" viewBox="0 0 16 16">
        <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
      </svg>
    } else {
      moonsvg = <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="currentColor" className="bi bi-moon" viewBox="0 0 16 16">
        <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"/>
      </svg>
    }
    var boxsvg = <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="currentColor" className="bi bi-square-half" viewBox="0 0 16 16">
      <path d="M8 15V1h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1zm6 1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
    </svg>
    var moon = <div className={"moon" + (pageData.darkmode ? " dark" : "")} onClick={toggleDarkMode}>{moonsvg}</div>;
    var box = <div className={"box" + (pageData.darkmode ? " dark" : "")} onClick={switchRight}>{boxsvg}</div>
    return (<div className={"modal" + (pageData.darkmode ? " dark" : "")} ref={modalRef}>{moon}{box}</div>)
  }

  function toggleModal() {
    setPageState([pageState[0], !pageState[1]])
  }

  function toggleDarkMode() {
    setPageData(prev => {return {clicks: prev.clicks, stamps: prev.stamps, odds: prev.odds, darkmode: !prev.darkmode, widget: prev.widget}});
  }

  function switchRight() {
    setPageData(prev => {return {clicks: prev.clicks, stamps: prev.stamps, odds: prev.odds, darkmode: prev.darkmode, widget: (prev.widget + 1) % 3}})
  }

  function Right() {
    switch (pageData.widget) {
      case 0:
        return;
      case 1:
        return "Superstition Box";
      case 2:
        return "Image Carrier";
      default:
        return "Whoa"
    }
  }

  return (
    <div className={"app" + (pageData.darkmode ? " dark" : "")} tabIndex='0' onKeyDown={addEncounter} onTouchStart={hideGear}>
      <div className="left">
        <div className="count" onClick={setClicks} style={{color: getStyle()}} tabIndex={0} onSubmit={setClicks}>
          {pageData.clicks}
        </div>
        <div className="bar">
          <Progress />
        </div>
        <div className="session">
          <div className="sessioncount">
            {pageData.stamps.length} this session
          </div>
          <div className="sessionodds" onClick={setOdds} tabIndex={0}>
            {pageData.odds}
          </div>
        </div>
        <div className={"stats" + (pageData.darkmode ? " dark" : "")} onClick={addEncounter} tabIndex={0}>
          <div className="rate">
            <div className="avg">avg. {humanizeDuration(getAverageWait(), { maxDecimalPoints: 2 })} run time</div>
            <div className="remaining">expected {humanizeDuration(getRemainingTime(), { largest: 2, maxDecimalPoints: 0, units: ["h","m"] })} until {Math.ceil(pageData.odds)}</div>
          </div>
          <div className="chance">
            <div className="odds">{getOdds().toFixed(2)}% odds to have caught by now</div>
            <div className="remaining">{getRemainingEncounters()} encounters until 90% odds</div>
          </div>
        </div>
      </div>
      <div className="right">
        <Right />
      </div>
      <div className="options" onMouseEnter={showGear} onMouseLeave={hideGear}>
        <CSSTransition nodeRef={gearRef} in={pageState[0]} timeout={200} classNames="gear-transition" unmountOnExit>
          <Gear/>
        </CSSTransition>
      </div>
      <div className="modal-container">
        <CSSTransition nodeRef={modalRef} in={pageState[1]} timeout={100} classNames="modal-transition" unmountOnExit>
          <Modal/>
        </CSSTransition>
      </div>
    </div>
  );
}

export default App;
