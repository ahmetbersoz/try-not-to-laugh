import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js'
import stepsDB from './data/steps.json';
import './App.css';

let steps;
const video = document.getElementById('video');

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
	faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo);

function startVideo() {
	navigator.getUserMedia(
		{ video: {} },
		stream => video.srcObject = stream,
		err => console.error(err)
	)
}

function App() {
	const timeStep = 5000; //milliseconds
	const [gameStatus, setGameStatus] = useState('initial'); //'initial', 'playing, 'win', 'fail'
	const [smilePercent, setSmilePercent] = useState(0); //0-1
	const [step, setStep] = useState({ id: 0, question: '', answer: '' });
	const [answerVisibility, setAnswerVisibility] = useState(false); //true, false
	const [remainingTime, setRemainingTime] = useState(timeStep);
	const [remainingTimeStarted, setRemainingTimeStarted] = useState(false);

	useEffect(() => {
		let timer;
		if (gameStatus === 'initial' || gameStatus === 'playing' ) {
			timer = setInterval(async () => {
				const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
				
				if (detections.length) {
					detections.forEach(detection => {
						setSmilePercent(detection.expressions.happy);

						if (smilePercent > 0.3 && gameStatus === 'initial') start();
						if (smilePercent > 0.2 && remainingTimeStarted) setGameStatus('fail');

					});
				}
			}, 100);
		} else {
			clearInterval(timer);
		}
		return () => clearInterval(timer);
	}, [gameStatus, smilePercent])

	useEffect(() => {
		let timer;
		if (remainingTimeStarted) {
			timer = setInterval(async () => {
				if (remainingTime === 0) {
					setAnswerVisibility(false);
					setRemainingTimeStarted(false);
					setRemainingTime(timeStep);
					goNextStep();
				}

				setRemainingTime(remainingTime => remainingTime - 100);
			}, 100);
		} else {
			clearInterval(timer);
		}
		return () => clearInterval(timer);
	}, [remainingTimeStarted, remainingTime])

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
					<div>
						<h2>Oyuna başlamak için gülümseyin!</h2>
						<p>
							<b>Oyun kuralı: </b>
							Sırayla soğuk espiriler gelecektir. Her espiriye 5 saniye gülmezseniz bir sonraki espriye geçersiniz. Gülerseniz kaybedersiniz. Hepsini gülmeden tamamlarsanız kazanırsınız.
						</p>
					</div>
				}
				{gameStatus === 'playing' &&
					<div>
						<div id="question"><h3>{step.question}</h3></div>
						<button onClick={() => showAnswer()}>CEVABI GÖSTER</button>
						{answerVisibility &&
							<div>
								<div id="answer"><h3>{step.answer}</h3></div>
								<div>{(remainingTime/1000).toFixed(0) > 0 ? (remainingTime/1000).toFixed(0) : 0}...</div>
							</div>
						}
					</div>
				}
				{gameStatus === 'win' &&
					<div>
						<h2>Tebrikler! Kazandın.</h2>
						<button onClick={start}>TEKRAR OYNA</button>
					</div>
				}
				{gameStatus === 'fail' &&
					<div>
						<h2>Maalesef... Kaybettin.</h2>
						<button onClick={start}>TEKRAR OYNA</button>
					</div>
				}
			</div>
		</div>
	);
}

export default App;