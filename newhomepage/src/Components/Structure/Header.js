import React from 'react';
import research_dev_psych from '../Images/research_dev_psych.jpg'
import example_code from '../Images/ExampleCode.png'

import '../Components.css';

// https://codesandbox.io/s/ecommerce-cflf4?file=/src/Header.js:66-3875

function Header() {
    return (
        <div>
            <div className="header">
                <h1 className="header-text">Machine Common Sense</h1>
            </div>

            <nav>
                <div className="wrapper">

                    <ul className="nav-links">
                        <label className="btn cancel-btn" htmlFor="cancel-btn"> <i className="fa fa-times"></i> </label>
                        <li><a href="/Home">Home</a></li>
                        <li><a href="/ProgramBackground">Program Background</a></li>
                        <li>
                            <a href="" className="desktop-item">Performers</a>
                            <input type="checkbox" id="showMega" />
                            <label htmlFor="showMega" className="mobile-item">Performers</label>

                            <div className="mega-box">
                                <div className="content">
                                    <div className="row thirds">
                                        <header>CORA</header>
                                        <ul className='mega-links'>
                                            <li><a href="/CORA/Team">Team</a></li>
                                            <li><a href="/CORA/Process">Process</a></li>
                                            <li><a href="/CORA/Highlights">Highlights</a></li>
                                            <li><a href="/CORA/Results">Results</a></li>
                                        </ul>
                                    </div>
                                    <div className="row thirds">
                                        <header>MESS</header>
                                        <ul className='mega-links'>
                                            <li><a href="/MESS/Team">Team</a></li>
                                            <li><a href="/MESS/Process">Process</a></li>
                                            <li><a href="/MESS/Highlights">Highlights</a></li>
                                            <li><a href="/MESS/Results">Results</a></li>
                                        </ul>
                                    </div>
                                    <div className="row thirds">
                                        <header>OPICS</header>
                                        <ul className='mega-links'>
                                            <li><a href="/OPICS/Team">Team</a></li>
                                            <li><a href="/OPICS/Process">Process</a></li>
                                            <li><a href="/OPICS/Highlights">Highlights</a></li>
                                            <li><a href="/OPICS/Results">Results</a></li>
                                        </ul>
                                    </div>


                                </div>
                            </div>
                        </li>
                        <li>
                            <a href="/Evaluation" className="desktop-item">Evaluations</a>
                            <input type="checkbox" id="showMega" />
                            <label htmlFor="showMega" className="mobile-item">Evaluations</label>

                            <div className="mega-box">
                                <div className="content">
                                    <div className="row">
                                        <img className="menu-image" src={research_dev_psych} alt="" />
                                    </div>
                                    <div className="row half">
                                        <header>Commonsense in the:</header>
                                        <ul className='mega-links'>
                                            <li><a href="/CommonsenseDomain/Agents">Agents Domain</a></li>
                                            <li><a href="/CommonsenseDomain/Objects">Objects Domain</a></li>
                                            <li><a href="/CommonsenseDomain/Places">Places Domain</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <a href="/Evaluation" className="desktop-item">Technical Info</a>
                            <input type="checkbox" id="showMega" />
                            <label htmlFor="showMega" className="mobile-item">Evaluations</label>

                            <div className="mega-box">
                                <div className="content">
                                    <div className="row">
                                        <img className="menu-image" src={example_code} alt="" />
                                    </div>
                                    <div className="row half">
                                        <ul className='mega-links'>
                                            <li><a href="/TechnicalInfo/ILE">Interactive Learning Environment</a></li>
                                            <li><a href="/TechnicalInfo/ILEOnline">Interactive Learning Environment Online</a></li>
                                            <li><a href="/TechnicalInfo/DataResults">Evaluation Data/Results</a></li>
                                            <li><a href="/TechnicalInfo/EvalPipeline">Evaluation Pipeline</a></li>
                                            <li><a href="/TechnicalInfo/EvalAnalysisUI">Evaluation Analysis UI</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </li>                        
                    </ul>
                    <label className="btn menu-btn" htmlFor="menu-btn"> <i className="fa fa-bars"></i> </label>

                </div>
            </nav>

        </div>
    );
}

export default Header;
