import React from 'react';
import '../Components.css';
import mcstask from '../Data/mcstasks.json'
import parse from "html-react-parser";

function Places() {
    const windowUrl = window.location.search;
    const params = new URLSearchParams(windowUrl);

    var taskId = params.get('TaskId');
    var taskObj;


    // console.log(taskId);

    for (var k in mcstask.task) {
        console.log(mcstask.task[k].id);
        if (mcstask.task[k].id === taskId){
            taskObj = mcstask.task[k];
            break;
        }
    }

    // console.log(taskObj)

    var taskRef = "";
    for (var l in taskObj.reference) {
        taskRef += "<li>"  + taskObj.reference[l].refText + "</li>";
    }
    // ../Images/Hypercubes/PassiveObjectPermanence.png
    // var hypercubeImage = taskObj.hypercubeImage;

    return (
        <div className="main-text">
            <div>
                <h2>{taskObj.name}</h2>
                <h3>Common Sense Concept:</h3>
                <h3>{taskObj.header}</h3>
                <h4>Evaluation: {taskObj.subheader}</h4>

            </div>

            {parse(taskObj.htmlText)}

            <div className="float-left-50 text-align-center">
                <div>
                    <i>{taskObj.hypercubeImageCaption}</i>
                    <img className="task-hypercube" src={taskObj.hypercubeImage} alt="" />
                </div>
            </div>


            <div className="float-left-50 text-align-center">
                <div>
                    <i>{taskObj.videoCaption}</i>
                    <video width="525" height="350" controls >
                        <source src={taskObj.video} type="video/mp4" />
                    </video>
                </div>

            </div>

            <div className="clear-fix"></div>
            <p></p>
            <hr/>
            <div>
                <h3>General Concept</h3>
                {parse(taskRef)}
            </div>
        </div>
    );
}

export default Places;
