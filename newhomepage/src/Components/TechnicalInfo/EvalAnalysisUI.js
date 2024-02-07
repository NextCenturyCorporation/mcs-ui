import React from 'react';
import '../Components.css';

function EvalAnalysisUI() {
  return (
    <div className="main-text">
      <h2>Evaluation Analysis UI</h2>
      <p>As CACI's Evaluation Pipeline completes a test scene, it pushes the evaluation artifact into a repository for immediate ingest into the Analysis UI.
        This gives the evaluator/evaluatee the ability to instantly review the test for issues.</p>
      <h3>Evaluatin Home Page</h3>
      <p></p>
      <h3>Test Overview</h3>
      <p></p>
      <h3>Query Builder</h3>
      <p></p>
      <h3>Scene Analysis</h3>
      <p></p>

      <h3>EOD-EXO Simulation</h3>
      <h5>Map Size:</h5>
      <input placeholder='In Meters'/>
      <h5>Simulation from Address:</h5>
      <input placeholder='Enter Address'/> <button>Generate</button>
      <h5>Random Simulation Environment:</h5>
      <select placeholder='Choose Environment'>
        <option>Urban</option>
        <option>Woodland/Jungle</option>
        <option>Mountain</option>
        <option>Desert</option>
      </select> <button>Generate</button>



      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>

      <h5>Improvised explosive device (IED) :</h5>
      <select placeholder='Choose Environment'>
        <option>Pressure/Pressure Release</option>
        <option>Trip Wire</option>
        <option>Sensors</option>
        <option>Radio Controlled</option>
        <option>Command Wire</option>
      </select>

      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>


      <h5>Explosive Capacity:</h5>
      <select placeholder='Choose Environment'>
        <option>1 lb</option>
        <option>5 lb</option>
        <option>10 lb</option>
        <option>20 lb</option>
        <option>50 lb</option>
      </select>

      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>


      <h5>Date:</h5>
      <input type="date" id="date" name="date"/><br/>
      <h5>Time:</h5>
      <input type="time" id="time" name="time"/>
      <h5>Lunar Phase:</h5>
      <select placeholder='Lunar Phase'>
        <option>Default (Date/Time/Geolocation)</option>
        <option>First Quarter</option>
        <option>Full</option>
        <option>Third Quarter</option>
        <option>New</option>
      </select>
      <h5>Weather:</h5>
      <select placeholder='Choose Environment'>
        <option>Default (Date/Time/Geolocation)</option>
        <option>Clear</option>
        <option>Rain</option>
        <option>Snow</option>
      </select>


      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>


      <h5>Ground based ordinance:</h5>
      <select>
        <option>Grenades</option>
        <option>Landmines</option>
        <option>Projectiles</option>
      </select>

      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>



    </div>

  );
}

export default EvalAnalysisUI;
