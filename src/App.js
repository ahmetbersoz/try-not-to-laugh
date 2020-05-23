import React, { useState } from 'react';
import useInterval from './customHooks/useInterval';
import * as faceapi from 'face-api.js'
import stepsDB from './data/steps.json';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'typeface-roboto';

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
	const tickInterval = 250;
	const [gameStatus, setGameStatus] = useState('initial'); //'initial', 'playing, 'win', 'fail'
	const [smilePercent, setSmilePercent] = useState(0); //0-1
	const [step, setStep] = useState({ id: 0, question: '', answer: '' });
	const [answerVisibility, setAnswerVisibility] = useState(false); //true, false
	const [remainingTime, setRemainingTime] = useState(timeStep);
	const [remainingTimeStarted, setRemainingTimeStarted] = useState(false);

	useInterval(async () => {
		if (gameStatus === 'initial' || gameStatus === 'playing' ) {
			if (!video.srcObject) return;
			const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

			if (detections.length) {
				detections.forEach(detection => {
					setSmilePercent(detection.expressions.happy);

					if (smilePercent > 0.3 && gameStatus === 'initial') start();
					if (answerVisibility && smilePercent > 0.2 && remainingTimeStarted) {
						setAnswerVisibility(false);
						setRemainingTimeStarted(false);
						setRemainingTime(timeStep);
						setGameStatus('fail');
					}
				});
			}

			if (answerVisibility) {
				if (remainingTime <= 0) {
					setAnswerVisibility(false);
					setRemainingTimeStarted(false);
					setRemainingTime(timeStep);
					goNextStep();
				}
				else setRemainingTime(remainingTime => remainingTime - tickInterval);
			}
		}
	}, tickInterval);

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
		<div className="panel-content">
			<>
				{gameStatus === 'initial' &&
					<>
						<h2>Oyuna başlamak için kameraya izin verip gülümseyin =)</h2>
						<p>
							<b>Oyun kuralı: </b>
							Sırayla soğuk espiriler gelecektir. Her espiriye 5 saniye gülmezseniz bir sonraki espriye geçersiniz. Gülerseniz kaybedersiniz. Hepsini gülmeden tamamlarsanız kazanırsınız.
						</p>
					</>
				}
				{gameStatus === 'playing' &&
					<>
						<div id="question"><h3>{step.question}</h3></div>
						{!answerVisibility &&
							<Button variant="primary" size="lg" onClick={() => showAnswer()}>CEVABI GÖSTER</Button>
						}

						{answerVisibility &&
							<div>
								<div className="answer"><h3>{step.answer}</h3></div>
								<div className="timer">{(remainingTime/1000).toFixed(0) > 0 ? (remainingTime/1000).toFixed(0) : 0}...</div>
							</div>
						}
					</>
				}
				{gameStatus === 'win' &&
					<>
						<h2>Tebrikler! Kazandın.</h2>
						<Button variant="success" size="lg" onClick={start}>TEKRAR OYNA</Button>
					</>
				}
				{gameStatus === 'fail' &&
					<>
						<h2>Maalesef... Kaybettin.</h2>
						<Button variant="danger" size="lg" onClick={start}>TEKRAR OYNA</Button>
					</>
				}
			</>
		</div>
	);
}

export default App;