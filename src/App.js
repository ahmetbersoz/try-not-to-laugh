import React, { useState, useEffect } from 'react';

const stepsDB = [
  {
    id: 1,
    question: 'Question 1',
    answer: 'Answer 1'
  },
  {
    id: 2,
    question: 'Question 2',
    answer: 'Answer 2'
  },
  {
    id: 3,
    question: 'Question 3',
    answer: 'Answer 3'
  }
];
let steps;

function App() {  
  const [gameStatus, setGameStatus] = useState('initial'); //'initial', 'playing, 'win', 'lose'
  const [smileStatus, setSmileStatus] = useState(false); //true, false
  const [step, setStep] = useState({ id: 0, question: '', answer: ''});
  const [answerVisibility, setAnswerVisibility] = useState(false); //true, false
  const [remainingTime, setRemainingTime] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      if (remainingTime === 0 || remainingTime === 0) {
        // goNextStep();
        return;
      }
      setRemainingTime(remainingTime => remainingTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }); 

  function start() {
    steps = stepsDB.slice(0);
    const randomIndex = Math.floor(Math.random()*steps.length);
    const nextStep = steps.splice(randomIndex, 1).pop();
    setStep(nextStep);
    setGameStatus('playing');
  }

  function showAnswer() {
    setAnswerVisibility(true);
    setRemainingTime(remainingTime => remainingTime - 1);
  }

  function goNextStep() {
    console.log(steps);
    const randomIndex = Math.floor(Math.random()*steps.length);
    const nextStep = steps.splice(randomIndex, 1).pop();
    setStep(nextStep);
  }

  return (
    <div>
      <div>WEBCAM</div>
      <div>
        { gameStatus === 'initial' && 
          <button onClick={start}>Start</button>
        }
        { gameStatus === 'playing' && 
          <div>
            <div id="question">{ step.question }</div>
            <button onClick={() => showAnswer()}>Show Answer</button>
            { answerVisibility && 
              <div id="answer">{ step.answer }</div>
            }
            <div>Remaining time: {remainingTime}</div>
          </div>
        }
        { gameStatus === 'win' && 
          <div>
            <div>Congrats! You win</div>
            <button onClick={start}>Play Again</button>
          </div>
        }
        { gameStatus === 'lose' && 
          <div>
            <div>Congrats! You lose</div>
            <button onClick={start}>Play Again</button>
          </div>
        }
      </div>
    </div>
  );
}

export default App;