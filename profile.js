const runLocal = false;
let url = "";

if (runLocal) {
    url = "http://localhost:5000/api/";
} else {
    url = "https://dein-dating-berater-backend.onrender.com/api/";
}


const waitOverlay = document.getElementById('wait-overlay');
const waitMessage = document.getElementById('wait-message');

// Function to update the profile dynamically
function updateProfile(data) {
    document.getElementById('name').textContent = data.name;
    document.getElementById('age').textContent = data.age + ' Jahre';
    document.getElementById('height').textContent = data.height + ' cm';
    document.getElementById('location').textContent = data.location;
    document.getElementById('description').textContent = data.description;
    document.getElementById('children-desire').textContent = "Kinderwunsch: " + data.childrenDesire;
    document.getElementById('smoker').textContent = "Raucherin: " + data.smoker;
    document.getElementById('languages').textContent = "Fremdsprachen: " + data.languages;
    document.getElementById('job').textContent = "Beruf: " + data.job;
    document.getElementById('interests').textContent = "Interessen: " + data.interests;
    document.getElementById('searchFor').textContent = "Auf der Suche nach: " + data.searchFor;

}

document.getElementById('submit-btn').addEventListener('click', function () {
    const profileData = {
        name: document.getElementById('name-input').value,
        age: document.getElementById('age-input').value,
        height: document.getElementById('height-input').value,
        location: document.getElementById('location-input').value,
        description: document.getElementById('description-input').value,
        childrenDesire: document.getElementById('children-desire-input').value,
        smoker: document.getElementById('smoker-input').value,
        languages: document.getElementById('languages-input').value,
        job: document.getElementById('job-input').value,
        interests: document.getElementById('interests-input').value,
        searchFor: document.getElementById('searchFor-input').value
    };

    console.log(profileData);
    sendProfileData(profileData);

    const imageInput = document.getElementById('profile-image-input');
    if (imageInput.files.length > 0) {
        const imageFile = imageInput.files[0];
        displayImagePreview(imageFile);  // Display the image without sending it to the backend
    }





});

let compareableProfiles = {
    originalProfile: null,
    improvedProfile: null,
};

// Function to display the uploaded image on the right side
function displayImagePreview(imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const profilePicture = document.getElementById('profile-picture');
        profilePicture.src = e.target.result;
        profilePicture.style.display = 'block'; // Show the image
    };
    reader.readAsDataURL(imageFile); // Convert the image to Base64 and show preview
}

async function sendProfileData(profileData) {

    waitMessage.innerHTML = "Bitte warte während dein Profil verbessert wird...";
    waitOverlay.style.display = 'flex';
    compareableProfiles.originalProfile = JSON.stringify(profileData);  // Store original profile as a string

    try {
        const response = await fetch(url+'improve-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profileData })  // Send the profile data in the request body
        });


        const result = await response.json();  // Parse the JSON response
        console.log("Result from Backend: " + result.improvedProfile);
        const data = result.improvedProfile

        compareableProfiles.improvedProfile = data; // store the improved profile

        updateProfile(JSON.parse(data));
        console.log("Compareable Profiles: ");
        console.log("Original Profile: " +compareableProfiles.originalProfile + " &  Improved Profile: "+ compareableProfiles.improvedProfile);
        thumbUp.removeEventListener("click",notYetReady);
        thumbDown.removeEventListener("click",notYetReady);
        ratingButton.removeEventListener("click",notYetReady);
        thumbUp.addEventListener("click", workingUp);
        thumbDown.addEventListener("click", workingDown);
        ratingButton.addEventListener("click", submitRating);

    } catch (error) {
        console.error('Error while communicating with the backend:', error);
        alert('Error while communicating with the backend:', error);
    } finally {
        waitOverlay.style.display = 'none';

    }
}

let selectedRating = null;
const thumbUp = document.getElementById("thumb-up");
const thumbDown = document.getElementById("thumb-down");
const ratingButton = document.getElementById("submit-rating");

thumbUp.addEventListener("click", notYetReady);
thumbDown.addEventListener("click", notYetReady);
document.getElementById("submit-rating").addEventListener("click", notYetReady);

function workingUp() {
    selectedRating = 1;
    thumbUp.classList.add("selected");
    thumbDown.classList.remove("down-selected");
    ratingButton.classList.add("rated");
    console.log(compareableProfiles);
}

function workingDown() {
    selectedRating = 0;
    thumbDown.classList.add("down-selected");
    thumbUp.classList.remove("selected");
    ratingButton.classList.add("rated");
    console.log(compareableProfiles);
}


function notYetReady() {
    alert("Bitte Verbessere zuerst dein Profil.")
}

// Submit rating to backend
async function submitRating() {
    if (selectedRating === null) {
        alert("Bitte wähle eine Verbesserung aus bevor du sie abschickst.");
        return;
    }
    waitMessage.innerHTML = "Bitte warte während deine Bewertung hochgeladen wird...";
    waitOverlay.style.display = 'flex';

    try {
        const response = await fetch(url+"uploadResults", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                originalProfile: compareableProfiles.originalProfile,
                improvedProfile: compareableProfiles.improvedProfile,
                rating: selectedRating
            }),
        });

        const data = await response.json();
        console.log("Rating submitted successfully:", data);
    } catch (error) {
        console.error("Error while submitting rating:", error);
        alert("Error while submitting rating:", error);
    } finally {
        waitOverlay.style.display = 'none';

    }
}