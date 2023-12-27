import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import './index.css';
import Header from './Components/Structure/Header'
import Footer from './Components/Structure/Footer'

import Evaluation from './Components/Evaluation'
import Home from './Components/Home'
import Internal from './Components/Internal'
import Performers from './Components/Performers'
import ProgramBackground from './Components/ProgramBackground'
import Data from './Components/TechnicalInfo/Data'
import ILE from './Components/TechnicalInfo/ILE'
import ILEOnline from './Components/TechnicalInfo/ILEOnline'
import EvalPipeline from './Components/TechnicalInfo/EvalPipeline'
import EvalAnalysisUI from './Components/TechnicalInfo/EvalAnalysisUI'
import Results from './Components/TechnicalInfo/Results'
import AgentsDomain from './Components/Commonsense/Agents'
import ObjectsDomain from './Components/Commonsense/Objects'
import PlacesDomain from './Components/Commonsense/Places'
import TaskTemplate from './Components/Commonsense/TaskTemplate'
import CORATeam from './Components/CORA/Team'
import CORAProcess from './Components/CORA/Process'
import CORAHighlights from './Components/CORA/Highlights'
import CORAResults from './Components/CORA/Results'
import MESSTeam from './Components/MESS/Team'
import MESSProcess from './Components/MESS/Process'
import MESSHighlights from './Components/MESS/Highlights'
import MESSResults from './Components/MESS/Results'
import OPICSTeam from './Components/OPICS/Team'
import OPICSProcess from './Components/OPICS/Process'
import OPICSHighlights from './Components/OPICS/Highlights'
import OPICSResults from './Components/OPICS/Results'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <div>
      <Header />
      <hr />
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/Home" Component={Home} />
        <Route path="/ProgramBackground" Component={ProgramBackground} />
        <Route path="/Performers" Component={Performers} />
        <Route path="/Evaluation" Component={Evaluation} />
        <Route path="/TechnicalInfo/Data" Component={Data} />
        <Route path="/TechnicalInfo/ILE" Component={ILE} />
        <Route path="/TechnicalInfo/ILEOnline" Component={ILEOnline} />
        <Route path="/TechnicalInfo/Results" Component={Results} />
        <Route path="/TechnicalInfo/EvalPipeline" Component={EvalPipeline} />
        <Route path="/TechnicalInfo/EvalAnalysisUI" Component={EvalAnalysisUI} />
        <Route path="/Internal" Component={Internal} />
        <Route path="/CommonsenseDomain/Agents" Component={AgentsDomain} />
        <Route path="/CommonsenseDomain/Objects" Component={ObjectsDomain} />
        <Route path="/CommonsenseDomain/Places" Component={PlacesDomain} />
        <Route path="/CommonsenseDomain/Task" Component={TaskTemplate} />
        <Route path="/CORA/Team" Component={CORATeam} />
        <Route path="/CORA/Process" Component={CORAProcess} />
        <Route path="/CORA/Highlights" Component={CORAHighlights} />
        <Route path="/CORA/Results" Component={CORAResults} />
        <Route path="/MESS/Team" Component={MESSTeam} />
        <Route path="/MESS/Process" Component={MESSProcess} />
        <Route path="/MESS/Highlights" Component={MESSHighlights} />
        <Route path="/MESS/Results" Component={MESSResults} />
        <Route path="/OPICS/Team" Component={OPICSTeam} />
        <Route path="/OPICS/Process" Component={OPICSProcess} />
        <Route path="/OPICS/Highlights" Component={OPICSHighlights} />
        <Route path="/OPICS/Results" Component={OPICSResults} />
      </Routes>
      <Footer />
    </div>
  </Router>
);
