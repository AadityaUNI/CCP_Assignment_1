const redoText = "You can re-record by clicking the button again!";
const recordingText = "Let your sweet voice out~";
const loadingText = "Getting your speech converted...";
const micOn = "images/mic.svg";
const micOff = "images/micoff.svg";

// add event listener to record buttons to take in the audio input
function micInput() {
    const recordBtn = document.getElementById("recordBtn");
    const recordDiv = document.getElementById("recordDiv");
    const textSuggestion = document.getElementById("textSuggestion");
    const micImg = document.getElementById("readyIMG");
    const textBox = document.getElementById("convertText");
    const textBoxDiv = document.getElementById("convertDiv");

    let stream = null;
    let mediaRecorder = null;

    recordDiv.onclick = async () => {
        console.log("Click detected");
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            mediaRecorder = new MediaRecorder(stream);
            // start the recording

            mediaRecorder.start();
            micImg.src = micOn;
            recordBtn.className = "stopRec";
            textSuggestion.innerText = recordingText;

            // event listener for mediaRecorder data storing
            mediaRecorder.addEventListener("dataavailable", async (ev) => {
                let audio = ev.data;
                // pass data into the audio element, and put its display on
                recordBtn.className = "loading";
                textSuggestion.innerText = loadingText;
                textBox.innerText = await getSpeechToText(audio);
                textSuggestion.innerText = redoText;
                textBoxDiv.className = "textBoxDiv";
                recordBtn.className = "startRec";
                micImg.src = micOff;
            })
        }
        else {
            // active, can only stop
            console.log("Clicked with stop");
            mediaRecorder.stop();
        }
    }
}

async function getSpeechToText(audio) {
    // pass blob to openAI
    console.log("returning, also got audio sized: ", audio.size);
    return "THIS IS THE TEXT LMAO WHAT THE FUCK";
}

// wait for document ot load
document.addEventListener("DOMContentLoaded", () => {
    micInput();
});