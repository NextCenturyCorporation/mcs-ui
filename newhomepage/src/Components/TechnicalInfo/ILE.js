import React from 'react';
import '../Components.css';

function ILE() {
    return (
        <div className="main-text">
            <h2>Interactive Learning Environment</h2>


            <div class="responsive-two-column-grid">
                <div>
                    <p>The Interactive Learning Environment(ILE) allowed teams to create and run their own set of test scenes to train on
                        concepts core to common sense reasoning, like physics, occlusion, navigation, localization, agency, and more. Evaluation scenes are
                        comprised of combinations of these concepts, and the simulation environment (or the "world") is the same for both training (via the ILE) and testing.</p>

                    <h3>MCS AI2-Thor</h3>
                    <p>A Unity project CACI Developers forked from <a href="https://github.com/allenai/ai2thor">https://github.com/allenai/ai2thor</a> and
                        modified for use on Machine Common Sense. This code base interprets the scene json created in the "Scene Generator" to build the low
                        fidelity 3D environment where we test the intelligent system on common sense priciples.
                        <li>Github Repo: <a href="https://github.com/NextCenturyCorporation/ai2thor">https://github.com/NextCenturyCorporation/ai2thor</a></li>
                    </p>

                    <h3>MCS</h3>
                    <p>A CACI developed Python interface for interacting with the MCS AI2Thor simulation environment and running scenes.
                        <li>Github Repo: <a href="https://github.com/NextCenturyCorporation/MCS">https://github.com/NextCenturyCorporation/MCS</a></li></p>
                    <p>The latest release of the MCS Python library is <mark><a href="">1.0.0</a></mark>. You can find the latest documentation <a href="https://nextcenturycorporation.github.io/MCS">here</a>.</p>

                    <h3>Scene Generator</h3>
                    <p>The Scene Generator is used to create training scenes for MCS Evaluations.
                        <li><a href="https://github.com/NextCenturyCorporation/mcs-scene-generator">https://github.com/NextCenturyCorporation/mcs-scene-generator</a></li>
                    </p>
                </div>
                <div>
                    <img src="/images/ILE.png" class="task-hypercube"></img>
                </div>
            </div>

        </div>

    );
}

export default ILE;
