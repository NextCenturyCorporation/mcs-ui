import React from 'react';
import '../Components.css';

function MESSTeam() {
    return (
        <div className="main-text">
            <h2>The MESS Team</h2>
            <h3>Model-Building, Exploratory, Social System</h3>
            <h4>Approach:</h4>
            <p>The MESS (Berkeley) Team approaches common-sense reasoning from an exploration-based perspective.</p>
            <h4>Framework:</h4>
            <p>The MESS framework implements three key learning mechanisms that underlie infant common sense: </p>
            <li> model building (with an emphasis on discovering the right representation); </li>
            <li> intrinsically motivated exploration; </li>
            <li> social learning through imitation. </li>

            <img src="/images/MESS_Framework.png" alt="MESS Framework"/>
            <h4>Team Lead:</h4>
            <p>David Fouhey, Ph.D</p>

        </div>
    );
}

export default MESSTeam;
