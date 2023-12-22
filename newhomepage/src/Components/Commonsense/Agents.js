import React from 'react';
import '../Components.css';

function Agents() {
  return (
    <div className="main-text">
        <h2>Commonsense in the Agents Domain</h2>
        <p>
        Tasks were designed to evaluate AI common sense about agents. Numerous experiments with infants and toddlers have examined their abilities to, for example, distinguish living organisms from inanimate objects, infer the goal of an actor’s behavior, and use living agents as a source of information. Early in life, children imitate social partners and begin to develop an understanding that seeing can lead to knowing. Additionally, some evidence suggests that infants recognize that agents can have idiosyncratic preferences, that they are drawn to prosocial rather than antisocial agents, and that they expect other agents to prefer affiliations with prosocial agents as well.  One of the goals of the MCS program was to evaluate the extent to which AI systems can come to behave as infants, toddlers, and young children do in experimental tasks designed to assess their understanding of agents.
        </p>
        <h3>List of the tasks:</h3>
        <li><a href="/CommonsenseDomain/Task?TaskId=SeeingLeadsToKnowing">Passive Seeing Leads to Knowing</a></li>
        <li><a href="/CommonsenseDomain/Task?TaskId=AgentIdentification">Interactive Agent Identification</a></li>
        <li><a href="/CommonsenseDomain/Task?TaskId=KnowledgeableAgents">Interactive Social Referencing</a></li>
        <li><a href="/CommonsenseDomain/Task?TaskId=SpatialReference">Interactive Spatial Reference</a></li>
        <li><a href="/CommonsenseDomain/Task?TaskId=Imitation">Interactive Imitation</a></li>
        <li><a href="/CommonsenseDomain/Task?TaskId=KnowledgeableAgents">Interactive Social Referencing</a></li>

        <p>
        Additional passive tasks designed to test the behavior of AI systems in tasks analogous to those used to probe infants' understanding of agents.
        </p>
        <li><a href="https://www.kanishkgandhi.com/bib">Baby Intuitions Benchmark (BIB)</a></li>


    </div>
  );
}

export default Agents;
