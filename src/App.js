import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js'

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
	const [step, setStep] = useState({ id: 0, question: '', answer: '' });
	const [answerVisibility, setAnswerVisibility] = useState(false); //true, false
	const [remainingTime, setRemainingTime] = useState(5);
	const [remainingTimeStarted, setRemainingTimeStarted] = useState(false);

	useEffect(() => {
		let timer;
		if (remainingTimeStarted) {
			timer = setInterval(() => {
				setRemainingTime(remainingTime => remainingTime - 1);
				if (remainingTime === 0) {
					setAnswerVisibility(false);
					setRemainingTimeStarted(false);
					setRemainingTime(5);
					goNextStep();
				}
			}, 1000);
		} else {
			clearInterval(timer);
		}
		return () => clearInterval(timer);
	}, [remainingTimeStarted, remainingTime])


	//getting video stream
	const video = document.getElementById('video');

	Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
		faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
		faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
		faceapi.nets.faceExpressionNet.loadFromUri('./models')
	]).then(startVideo);

	function startVideo() {
		navigator.getUserMedia(
			{ video: {} },
			stream => video.srcObject = stream,
			err => console.error(err)
		)
	}

	video.addEventListener('play', () => {
		const canvas = faceapi.createCanvasFromMedia(video)
		document.body.append(canvas)
		const displaySize = { width: video.width, height: video.height }
		faceapi.matchDimensions(canvas, displaySize)
		setInterval(async () => {
			const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
			const resizedDetections = faceapi.resizeResults(detections, displaySize)
			canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
			faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
			faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
		}, 100)
	})



	function start() {
		steps = stepsDB.slice(0);
		const randomIndex = Math.floor(Math.random() * steps.length);
		const nextStep = steps.splice(randomIndex, 1).pop();
		setStep(nextStep);
		setGameStatus('playing');
	}

	function showAnswer() {
		setAnswerVisibility(true);
		setRemainingTimeStarted(true);
	}

	function goNextStep() {
		if (steps.length === 0) {
			setGameStatus('win');
			return;
		}

		const randomIndex = Math.floor(Math.random() * steps.length);
		const nextStep = steps.splice(randomIndex, 1).pop();
		setStep(nextStep);
	}

	return (
		<div>
			<div>
				{gameStatus === 'initial' &&
					<button onClick={start}>Start</button>
				}
				{gameStatus === 'playing' &&
					<div>
						<div id="question">{step.question}</div>
						<button onClick={() => showAnswer()}>Show Answer</button>
						{answerVisibility &&
							<div id="answer">{step.answer}</div>
						}
						<div>Remaining time: {remainingTime}</div>
					</div>
				}
				{gameStatus === 'win' &&
					<div>
						<div>Congrats! You win</div>
						<button onClick={start}>Play Again</button>
					</div>
				}
				{gameStatus === 'lose' &&
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