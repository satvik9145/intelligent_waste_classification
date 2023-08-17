// Global variables
let video;
let model;

// Define class labels and their respective URLs for information
const classLabels = [
    'Cardboard waste', 'Glass waste', 'Metal waste', 'Paper waste',
    'Plastic waste', 'Trash waste', 'Organic waste', 'E-waste'
];

const classUrls = [
    'https://example.com/cardboard-info', 'https://example.com/glass-info',
    'https://example.com/metal-info', 'https://example.com/paper-info',
    'https://example.com/plastic-info', 'https://example.com/trash-info',
    'https://example.com/organic-info', 'https://example.com/e-waste-info'
];

// Define class sound effect IDs (matches audio element IDs)
const classSoundIds = [
    'cardboard-sound', 'glass-sound', 'metal-sound', 'paper-sound',
    'plastic-sound', 'trash-sound', 'organic-sound', 'e-waste-sound'
];

// Function to play the welcome voice message
function playWelcomeMessage() {
    const welcomeMessage = new SpeechSynthesisUtterance('Welcome to Waste Classification. Use your webcam to classify waste materials.');
    window.speechSynthesis.speak(welcomeMessage);
}

window.addEventListener('load', function() {
    // Play the welcome voice message
    playWelcomeMessage();
});
  

// Function to start the webcam feed
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
}

// Function to stop the webcam feed
function stopWebcam() {
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
}

// Function to play sound based on class index
function playClassSound(classIndex) {
    const audioElement = document.getElementById(classSoundIds[classIndex]);
    audioElement.play();
}

// Function to perform waste classification
async function classifyWaste() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = tf.browser.fromPixels(canvas).expandDims();

    // Preprocess the image for model input (resize and normalize)
    const resizedImage = tf.image.resizeBilinear(image, [224, 224]);
    const normalizedImage = resizedImage.div(255.0).sub(0.5).mul(2.0);

    // Perform inference using the loaded model
    const prediction = model.predict(normalizedImage);

    // Get the predicted class index
    const classIndex = tf.argMax(prediction, 1).dataSync()[0];

    // Display the result on the webpage with a linked class label
    const resultDiv = document.getElementById('result');
    const classLabel = classLabels[classIndex];
    const classUrl = classUrls[classIndex];
    resultDiv.innerHTML = `Classification Result: <a href="http://127.0.0.1:5500/waste_types.html" target="_blank">${classLabel}</a>`;

    // Cleanup (dispose tensors to release memory)
    tf.dispose(image);
    tf.dispose(resizedImage);
    tf.dispose(normalizedImage);
    tf.dispose(prediction);
}

const slideshows = document.querySelectorAll('.slideshow');

slideshows.forEach(slideshow => {
    let slideIndex = 0;

    function showSlide(index) {
        if (index < 0) {
            index = slideshow.children.length - 1;
        } else if (index >= slideshow.children.length) {
            index = 0;
        }

        slideshow.style.transform = `translateX(-${index * 100}%)`;
        slideIndex = index;
    }

    setInterval(() => {
        showSlide(slideIndex + 1);
    }, 3000);
});
// Function to play button sound effect
function playButtonSound() {
    const buttonSound = document.getElementById('button-sound');
    buttonSound.play();
}

// Event listener for the classify button
document.getElementById('classify-button').addEventListener('click', function() {
    classifyWaste();
    playButtonSound(); // Play the sound effect
});

// Event listener for the classify button
document.getElementById('classify-button').addEventListener('click', classifyWaste);

// Initialize the TensorFlow.js model
async function loadModel() {
    try {
        model = await tf.loadLayersModel('./model/model.json');
    } catch (error) {
        console.error('Error loading the model:', error);
    }
}

// Start the webcam feed and load the model on page load
document.addEventListener('DOMContentLoaded', async () => {
    video = document.getElementById('video');
    await startWebcam();
    await loadModel();
    console.log(model);
});

// Stop the webcam feed when the page is closed or refreshed
window.addEventListener('beforeunload', stopWebcam);
