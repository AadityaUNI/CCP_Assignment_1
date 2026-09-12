const redoText = "You can re-record by clicking the button again!";
const recordingText = "Let your sweet voice out~";
const loadingText = "Getting your speech converted...";
const micOn = "images/mic.svg";
const micOff = "images/micoff.svg";
const errorText = "Error retrieving your speech, please try again.";

// add event listener to record buttons to take in the audio input
function micInput() {
    const recordBtn = document.getElementById("recordBtn");
    const recordDiv = document.getElementById("recordDiv");
    const textSuggestion = document.getElementById("textSuggestion");
    const micImg = document.getElementById("readyIMG");
    const textBox = document.getElementById("convertText");
    const textBoxDiv = document.getElementById("convertDiv");
    const recLabel = document.getElementById("recLabel");
    // 1. Target the new status label

    let stream = null;
    let mediaRecorder = null;

    let isRequesting = false;

    recordDiv.onclick = async () => {
        console.log("Click detected");
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            // check for double clicks
            if (isRequesting) {
                return;
            }
            isRequesting = true;
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            mediaRecorder = new MediaRecorder(stream);
            isRequesting = false;

            // start the recording
            mediaRecorder.start();
            micImg.src = micOn;
            recordBtn.className = "stopRec";
            textSuggestion.innerText = recordingText;
            recLabel.innerText = "Stop Recording";

            // 2. Update to "Recording"
            recLabel.innerText = "Recording...";
            recLabel.style.color = "#ff3c3e";

            // event listener for mediaRecorder data storing
            mediaRecorder.addEventListener("dataavailable", async (ev) => {
                let audio = ev.data;

                // pass data into the audio element, and put its display on
                recordBtn.className = "loading";
                textSuggestion.innerText = loadingText;
                try {
                    textBox.innerText = await getSpeechToText(audio);
                }
                catch (e) {
                    mediaRecorder.stop();
                    stream.getTracks().forEach(track => track.stop());
                    textBox.innerText = errorText;
                    recLabel.innerText = "Start Recording";
                }
                textSuggestion.innerText = redoText;
                textBoxDiv.className = "textBoxDiv";
                recordBtn.className = "startRec";
                recLabel.innerText = "Recorded. Click again to record a new transcription.";
                micImg.src = micOff;

                // 3. Update to "Recorded" once speech-to-text is finished
                recLabel.style.color = "#888888"; // Revert to standard gray
            })
        }
        else {
            // active, can only stop
            console.log("Clicked with stop");
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
        }
    }
}

async function getSpeechToText(audio) {
    // pass blob to backend
    console.log("returning, also got audio sized: ", audio.size);

    const response = await fetch("/api/v1/getTextFromSpeech", {
        method: "POST",
        body: audio
    });
    if (!response.ok) {
        throw new Error("Error getting audio");
    }
    return await response.text();




}

// wait for document ot load
document.addEventListener("DOMContentLoaded", () => {
    micInput();
});