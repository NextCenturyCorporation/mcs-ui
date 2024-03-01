import React from 'react';
import '../Components.css';

function Footer() {
  return (
    <div className="mcs-footer">
      <div>
        <div className="footer-program">
          <p>
            <span className="important">DARPA Sponsor:</span><br />
            <strong>Howie Shrobe</strong><br />
            Program Manager
          </p>
          <p><a href="https://www.darpa.mil/program/machine-common-sense">DARPA's Program Site</a></p>
          <p>Webiste maintained by:<br />
            <a href="https://www.caci.com/">CACI</a>
          </p>
        </div>
        <div className="footer-performers">
          <div className="footer-performers-title">
            <p>Performers</p>
          </div>

          <div className="footer-performer">
            CORA
            <p>
              <li>IBM</li>
              <li>MIT</li>
              <li>Harvard</li>
              <li>Stanford</li>
            </p>
          </div>
          <div className="footer-performer">
            MESS
            <p>
              Model-Building, Exploratory, Social System
              <li>UC Berkeley</li>
              <li>CMU</li>
              <li>UMichigan</li>
              <li>MIT</li>
              <li>UIUC</li>
            </p>
          </div>
          <div className="footer-performer">
            OPICS
            <p>
            Obvious Plans and Inferences for Common Sense
              <li>Oregon State University</li>
              <li>New York University</li>
              <li>University of Utah</li>
            </p>
          </div>

        </div>


        <div className="footer-liability">
          <p>This research was developed with funding from the Defense Advanced Research Projects Agency (DARPA). The views, opinions and/or findings expressed are those of the author and should not be interpreted as representing the official views or policies of the Department of Defense or the U.S. Government.</p>
        </div>
      </div>


    </div>
  );
}

export default Footer;
