import React from 'react';
import './Components.css';

function Home() {
  return (
    <div className="main-text">
      <h2>Machine Common Sense</h2>
      <p>Despite significant advances in artificial intelligence (AI), even the most sophisticated AI systems lack common
        sense. In contrast, very young children show forms of “common sense” reasoning. Most toddlers will actively seek
        needed information from other agents in order to solve problems, look for no-longer-visible objects after seeing
        those objects hidden, and reason nimbly about where to look for an object given the constraints of the
        environment.
        Unfortunately, AI systems in the early 2020s do none of these things reliably. AI systems do not understand the
        world, so they have trouble performing basic tasks such as behaving appropriately in unpredictable situations or
        engaging in natural interactions with people. Overcoming these limitations is key to making AI systems that are
        able
        to be of genuine value to human beings.</p>

      <p>
        To address this challenge, the U.S. Defense Advanced Research Projects Agency (DARPA) funded the Machine Common
        Sense (MCS) program in 2018. Among the stated goals of this program were enabling AI applications to “understand
        new
        situations, monitor the reasonableness of their actions, communicate more effectively with people, and transfer
        learning to new domains.”
      </p>

      <p>
        The MCS program had three distinct Technical Areas (TAs). One TA was focused on “Broad Common Knowledge” and was
        charged with developing AI systems able to learn commonsense knowledge from the internet; this TA concentrated
        on
        natural language inferences and on answering questions about physical and social interactions. The other two TAs
        worked toward developing AI systems with child-level common sense. One of these TAs worked to develop AI systems
        able to simulate early-developing, nonverbal common sense about objects, agents, and places—the kind of common
        sense
        thought to characterize infants and toddlers. The other TA worked to develop benchmarks based on research
        findings
        about common sense in infants and toddlers. The pages on this website provide an overview of the work conducted
        by
        these latter two TAs. This website provides information primarily about how the child-level common sense of the
        newly developed AI systems was evaluated.
      </p>
    </div>
  );
}

export default Home;
