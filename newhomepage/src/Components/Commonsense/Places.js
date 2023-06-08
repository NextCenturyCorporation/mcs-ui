import React from 'react';
import '../Components.css';

function Places() {
    return (
        <div className="main-text">
            <h2>Commonsense in the Places Domain</h2>
            <p>
                Tasks were designed to evaluate AI common sense about places. Research has explored children's common sense understanding of location, both of the location of their own bodies in space and of the location of objects. Scientific studies have examined infants' and toddlers' abilities to navigate obstacles and environments, and to orient themselves in space using <a href="">landmarks or room geometry after reorientation</a>. Children are able to retrieve objects from inside a container, behind an occluding object (i.e., out of view), or ) initially located outside of the visual field; they can also navigate around objects in order to retrieve visible objects. Studies have further investigated how children infer the location of an object via a logical process of elimination, or to track the movement of an object across displacements. Experimental work conducted with infants and toddlers provided the inspiration for these MCS tasks, which were developed to assess artificial intelligence systems' common sense in the "places" domain.
            </p>
            <h3>List of Interactive Places tasks:</h3>
            <li><a href="#">Container</a></li>
            <li><a href="#">Holes</a></li>
            <li><a href="#">Lava</a></li>
            <li><a href="#">Obstacle</a></li>
            <li><a href="#">Occluder</a></li>
            <li><a href="#">Ramp</a></li>
            <li><a href="#">Set Rotation</a></li>
            <li><a href="#">Shell Game</a></li>
            <li><a href="#">Spatial Elimination</a></li>
            <li><a href="#">Spatial Reorientation</a></li>
        </div>
    );
}

export default Places;
