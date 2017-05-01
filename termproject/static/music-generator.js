
// Track visualization and selection functionality

var trackContainer = document.querySelector("#waveformContainer"),
    selection = document.querySelector("#selection"),
    volControl = document.querySelector("#volControl"),
    thumbs = document.querySelectorAll(".thumb"),
    audioLoading = document.querySelector("#audioLoading");

var trackList = [];
function populateTracklist() {
	var audioElems = document.querySelectorAll(".track");
	for(var i = 0; i < audioElems.length; i++) {
		trackList.push(audioElems[i].dataset.trackPath);
	}
}
populateTracklist();

var currentTrack = 0;
function setCurrentTrack(index) {
    pauseMusic();
    
	containers[currentTrack].classList.remove('active');

	currentTrack = index;
	playMusic();

	containers[currentTrack].classList.add('active');
}

function seekToTrack(index) {
	pauseMusic();

	// Skip past all next tracks in between
	for(var i = currentTrack; i < index; i++) {
		waveSurfers[i].seekTo(1);
		soundStarted[i] = true;
	}

	// Revert all previous tracks in between
	for(var i = index; i <= currentTrack; i++) {
		waveSurfers[i].seekTo(0);
		soundStarted[i] = false;
	}

	songs[index].stop();
	setCurrentTrack(index);
}

var isPlaying = false;
function pauseMusic() {
    waveSurfers[currentTrack].pause();
    
	songs[currentTrack].pause();
    
    isPlaying = false;
}
function playMusic() {
	if(!isPlaying) {
	    waveSurfers[currentTrack].play();

	    // Play our new track
	    if(!soundStarted[currentTrack]) {
	    	soundStarted[currentTrack] = true;

	    	songs[currentTrack].play();
	    } else { // Same track as last time
	   		songs[currentTrack].play();
	    }

	    songs[currentTrack].setVolume(volume);
	    
	    isPlaying = true;
	}
}
function toggleMusic() {
    if(isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}
function stopMusic() {
	waveSurfers[currentTrack].stop();
	songs[currentTrack].stop();
}

var volume = 0.3;
function setVolume(vol) {
	volume = vol / 100;
	songs[currentTrack].setVolume(volume);
}

// Scroll the player over if the currently playing track starts afterwards
var hasBeenClicked = false;
function checkOffScreen(elem, WS) {
	if(waveSurfers[currentTrack].isPlaying()) {
		var rect = elem.getBoundingClientRect(),
			cursorPos = WS.getCurrentTime() / WS.getDuration() * rect.width;

		if(rect.left + cursorPos >= window.innerWidth) {
			trackContainer.scrollLeft += window.innerWidth;
		}
	}
}
function runCheck() {
	if(!hasBeenClicked) {
		checkOffScreen(containers[currentTrack], waveSurfers[currentTrack]);
		window.requestAnimationFrame(runCheck);
	}
}
window.requestAnimationFrame(runCheck);


var containers = [],
    waveSurfers = [],
	soundStarted = [];
// Loop through the tracks we have
for(var i = 0; i < trackList.length; i++) {
	// Get the track name
	var trackName = trackList[i].slice(0, -4); // Remove .mp3 extension
	trackName = trackName.substr(trackName.lastIndexOf('/') + 1)

	// Create a new container to use
	var myContainer = document.createElement("div");
	myContainer.id = trackName;

	containers.push(myContainer);

	trackContainer.appendChild(myContainer);

	soundStarted.push(false);

	// Create a new Wave Surfer for each
	var myWS = WaveSurfer.create({
	    container: "#" + trackName,
	    waveColor: 'grey',
	    progressColor: "#315A83", //'rgb(79,172,254)',
	    fillParent: false,
	    interact: false,
	    minPxPerSec: Math.round(window.innerWidth / 13.333)
	});

	// Mute it because we're using p5.js' audio player
	myWS.setVolume(0);
	
	// Update the background visualization
	(function(i) {
	    myWS.load(trackList[i]);

	    myWS.on('ready', function() {
	    	audioLoading.style.display = "none";
	    });
	    
		myWS.on('finish', function() {
			setCurrentTrack(i + 1);
		});
		
		waveSurfers.push(myWS);
	}(i));
    
	
}


document.body.onkeyup = function(e) {
	// 32 = spacebar
	// 13 = enter
    if(e.keyCode === 13) {
        toggleMusic();
    }
}


function handleThumbClick(thumbClicked) {
	if(thumbClicked === thumbs[0]) {
		if(thumbClicked.classList.contains("selected")) {
			thumbClicked.classList.remove("selected");
		} else {
			// Send the response to the server
			data.rating = 1;
			console.log(data);

			thumbClicked.classList.add("selected");
			thumbs[1].classList.remove("selected");
		}
	} else {
		if(thumbClicked.classList.contains("selected")) {
			thumbClicked.classList.remove("selected");
		} else {
			// Send the response to the server
			data.rating = -1;
			console.log(data);

			thumbClicked.classList.add("selected");
			thumbs[0].classList.remove("selected");
		}
	}
}



var isMouseDown = false,
    startOffsetX,
    clickedElementIndexes = [],
    clickedElementIds = [],
    firstClickPos,
    firstSelectedElement,
    data = {};
    
trackContainer.onmousedown = function(e) {
    isMouseDown = true;
    startOffsetX = e.x + trackContainer.scrollLeft;
    selection.style.width = "0px";
    selection.style.left = startOffsetX + "px";
    clickedElementIndexes = [];
    
    // Get the track clicked
    firstSelectedElement = document.elementFromPoint(e.pageX, e.pageY).parentNode.parentNode;
    var index = containers.indexOf(firstSelectedElement);
    firstClickPos = e.pageX;
    
    // Handle selection of grey part
    if(index === -1
    && typeof document.elementFromPoint(e.pageX, e.pageY).parentNode.parentNode != undefined) {
    	firstSelectedElement = document.elementFromPoint(e.pageX, e.pageY).parentNode.parentNode.parentNode;
    	index = containers.indexOf(firstSelectedElement);
    }

    if(index != null) {
        clickedElementIndexes.push(index);
    }
}
trackContainer.onmousemove = function(e) {
    if(isMouseDown) {
    	var mouseX = e.x + trackContainer.scrollLeft;
        // Get the mouse location
        if(mouseX > startOffsetX) {
            selection.style.left = startOffsetX + "px";
            selection.style.width = mouseX - startOffsetX + "px";
        } else {
            selection.style.left = mouseX + "px";
            selection.style.width = startOffsetX - mouseX + "px";
        }
    }
}
trackContainer.onmouseup = function(e) {
    isMouseDown = false;
    startOffsetX = null;
    
    // Get the track(s) selected
    // Get the track of mouseup
    var index,
        lastIndex = clickedElementIndexes[0];

    var secondSelectedElement;
    // The index of the element when the mouse stops dragging
    if(typeof document.elementFromPoint(e.pageX, e.pageY) != undefined) {
    	secondSelectedElement = document.elementFromPoint(e.pageX, e.pageY).parentNode.parentNode;
	    index = containers.indexOf(secondSelectedElement);
	}

    // Handle selection of grey part
    if(index === -1
    && typeof document.elementFromPoint(e.pageX, e.pageY).parentNode.parentNode != undefined) {
    	secondSelectedElement = document.elementFromPoint(e.pageX, e.pageY).parentNode.parentNode.parentNode;
    	index = containers.indexOf(secondSelectedElement)
    }
    
    // Get any tracks between
    clickedElementIds = [];
    var secondClickPos = e.pageX + trackContainer.scrollLeft,
    	larger = index,
        smaller = lastIndex;

    var firstPercent = 0,
    	secondPercent = 0,
    	startTime = 0,
    	endTime = 0;

    if(lastIndex != index) {
    	hasBeenClicked = true;
    }

    if(lastIndex != -1
    && index != -1
    && lastIndex != index) {
        
        if(index < lastIndex) {
            smaller = index;
            larger = lastIndex;

            // Get mouse position so we can calculate the time of the selection
            secondClickPos = firstClickPos;
            firstClickPos = e.pageX;

            var tempElem = secondSelectedElement;
            secondSelectedElement = firstSelectedElement;
            firstSelectedElement = tempElem;
        }
        
        for(var i = smaller; i <= larger; i++) {
            clickedElementIds.push(containers[i].id);
        }
    } else if(index != -1) {
        clickedElementIds.push(containers[index].id);
    }

     // Update our data object
    data = { "ids": clickedElementIds, "startTime": startTime, "endTime": endTime};

    if(lastIndex != -1
    && index != -1) {
    	// Calculate the start and end times of the selection
        firstPercent = (firstClickPos - firstSelectedElement.offsetLeft) / firstSelectedElement.offsetWidth;
	    secondPercent = (secondClickPos - secondSelectedElement.offsetLeft) / secondSelectedElement.offsetWidth;
	    startTime = waveSurfers[smaller].backend.getDuration() * firstPercent;
	    endTime = waveSurfers[larger].backend.getDuration() * secondPercent;
    }


     // If there's not really a selection, don't allow it
    if(selection.clientWidth === 0) {
    	if(lastIndex != -1
    	&& index != -1) {
    		
	        // Seek to the click location
	        waveSurfers[smaller].seekTo(secondPercent);
	        songs[currentTrack].jump(startTime);
	        pauseMusic();

	        data = {};
	    }

	    clickedElementIds = [];

	    disableVoting();
    } else { // Enable/disable thumb voting
    	enableVoting();
    }
    
   
}


function enableVoting() {
	thumbs[0].classList.remove("disabled");
	thumbs[0].classList.remove("selected");
	thumbs[1].classList.remove("disabled");
	thumbs[1].classList.remove("selected");
}
function disableVoting() {
	thumbs[0].classList.add("disabled");
	thumbs[0].classList.remove("selected");
	thumbs[1].classList.add("disabled");
	thumbs[1].classList.remove("selected");
}




// Background visualization
var fft, // Allow us to analyze the song
    numBars = 32, // The number of bars to use; power of 2 from 16 to 1024
    song; // The p5 sound object

// Returns a single rgb color interpolation between given rgb color
// based on the factor given; via https://codepen.io/njmcode/pen/axoyD?editors=0010
function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) {
        factor = 0.5;
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};
// My function to interpolate between two colors completely, returning an array
function interpolateColors(color1, color2, steps) {
    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);

    for(var i = 0; i < steps; i++) {
        interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
    }

    return interpolatedColorArray;
}


var canvas;
function setup() { // Setup p5.js
    canvas = createCanvas(windowWidth, windowHeight);

    if(typeof volControl !== "undefined") {
		setVolume(volControl.value);
	} else {
		setVolume(50);
	}
}

var songs = [];
function preload() {
	for(var i = 0; i < trackList.length; i++) {
		songs.push(loadSound(trackList[i]));
	}
}

var colorArray = interpolateColors("rgb(79,172,254)", "rgb(0,242,254)", numBars),
    hasRan = false;
function draw() {
	//background(51);
    background(255);

    if(!hasRan) { // Do once

        fft = new p5.FFT();
        fft.waveform(numBars);
        fft.smooth(0.85);

        hasRan = true;
    }
    
    if(typeof fft != "undefined") {
        var spectrum = fft.analyze();
        noStroke();
        for(var i = 0; i < numBars; i++) {
            fill(colorArray[i]);
            var x = map(i, 0, numBars, 0, width);
            var h = -height + map(spectrum[i], 0, 255, height, 0);
            rect(x, height / 2 - h / 2, width / numBars, h);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

