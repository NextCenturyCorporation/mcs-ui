import React from 'react';
import './Components.css';

function ProgramBackground() {
  return (
    <div className="main-text">
      <h2>Program Background</h2>

      <p>Machine common sense has long been a critical but missing component of Artificial Intelligence (AI). Recent advances in machine learning have created new AI capabilities, but machine reasoning across these applications remains narrow and highly specialized. Current machine learning systems must be carefully trained or programmed for every situation.
      </p>
      <p>Common sense is defined as, “the basic ability to perceive, understand, and judge things that are shared by ('common to') nearly all people and can reasonably be expected of nearly all people without need for debate.”<sup>1</sup> Humans are usually not conscious of the vast sea of commonsense assumptions that underlie every statement or action. This shared, unstated background knowledge includes a general understanding of how the physical world works (i.e., intuitive physics), a basic understanding of human motives and behaviors (i.e., intuitive psychology), and a knowledge of the common facts that an average adult possesses.
      </p>
      <p>The absence of common sense prevents intelligent systems from understanding their world, behaving reasonably in unforeseen situations, communicating naturally with people, and learning from new experiences. Its absence is considered the most significant barrier between the narrowly focused AI applications of today and the more general, human-like AI systems hoped for in the future. Common sense reasoning's obscure but pervasive nature makes it difficult to articulate and encode.
      </p>
      <p>The Machine Common Sense (MCS) program seeks to address the challenge of machine common sense by pursuing two broad strategies. Both envision machine common sense as a computational service, or as machine commonsense services. The first strategy aims to create a service that learns from experience, like a child, to construct computational models that mimic the core domains of child cognition for objects (intuitive physics), agents (intentional actors), and places (spatial navigation). The second strategy seeks to develop a service that learns from reading the Web, like a research librarian, to construct a commonsense knowledge repository capable of answering natural language and image-based questions about commonsense phenomena.
      </p>

      <li><sup>1</sup> <a href="https://en.wikipedia.org/wiki/Common_sense">https://en.wikipedia.org/wiki/Common_sense</a></li>
      <li><a href="https://www.darpa.mil/program/machine-common-sense">DARPA Machine Common Sense Page</a></li>
      <li><a href="https://arxiv.org/abs/1810.07528">Concept Paper at Arxiv</a></li>
      <li><a href="https://www.youtube.com/watch?v=rSrzMGqkU-M">Proposer's Day YouTube Video</a></li>

    </div>
  );
}

export default ProgramBackground;
