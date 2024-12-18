const runLocal = false;
const debugLog = false;
let url = "";

if (runLocal) {
    if (debugLog) {
        console.log(`Backend server running on http://localhost:5000`);
        console.log(`Profile Database on http://localhost:5000/api/admin/profiles`)
        console.log(`Reset Profile Database on http://localhost:5000/api/admin/reset-profiles`)
    }
    url = "http://localhost:5000/api/";
} else {
    if (debugLog) {
        console.log(`Backend server running on https://dein-dating-berater-backend.onrender.com`);
        console.log(`Profile Database on https://dein-dating-berater-backend.onrender.com/api/admin/profiles`);
        console.log(`Reset Profile Database on https://dein-dating-berater-backend.onrender.com/api/admin/reset-profiles`)
    }
    url = "https://dein-dating-berater-backend.onrender.com/api/";
}

;

const waitOverlay = document.getElementById('wait-overlay');
const waitMessage = document.getElementById('wait-message');

let selectedRating = null;
let compareableProfiles = {
    originalProfile: null,
    improvedProfile: null,
    improvement_message: null,
};
const rating_div = document.getElementById("rating_field");
const thumbUp = document.getElementById("thumb-up");
const thumbDown = document.getElementById("thumb-down");
const ratingButton = document.getElementById("submit-rating");
const ratingCompleted = document.getElementById("rating_completed");

thumbUp.addEventListener("click", notYetReady);
thumbDown.addEventListener("click", notYetReady);
document.getElementById("submit-rating").addEventListener("click", notYetReady);

waitOverlay.addEventListener("click", removeInfo);

function removeInfo() {
    waitOverlay.style.display = "none";
    waitOverlay.removeEventListener("click", removeInfo);
}

// Methode um die Daten anzuzeigen
function updateProfile(data) {
    document.getElementById('headline_output').textContent = "Verbessertes Profil:";

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

// Beim drücken auf dem Button werden die eingetragenen Daten gesammelt und weitergeleitet
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

    if (debugLog) console.log(profileData);
    sendProfileData(profileData);

});



// Methode um das Bild einzulesen und wieder anzuzeigen
function displayImagePreview(imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const profilePicture = document.getElementById('profile-picture');
        profilePicture.src = e.target.result;
        profilePicture.style.display = 'block';
    };
    reader.readAsDataURL(imageFile);
}

// Methode um Profildaten an das Backend zu senden
async function sendProfileData(profileData) {

    // Wartenachricht anzeigen
    waitMessage.innerHTML = "Bitte warte während dein Profil verbessert wird...";
    waitOverlay.style.display = 'flex';

    // Original Profil speichern
    compareableProfiles.originalProfile = JSON.stringify(profileData);

    try {
        const response = await fetch(url + 'improve-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profileData })  // Profildaten an Backend senden und verbesserte Version empfangen
        });


        const result = await response.json();
        if (debugLog) console.log("Antwort vom Backend: " + result.improvedProfile);
        const data = result.improvedProfile

        compareableProfiles.improvedProfile = data; // Verbesserte Version speichern
        if (debugLog) console.log("Zu vergleichende Profile: ");
        if (debugLog) console.log("Originales Profil: " + compareableProfiles.originalProfile + " &  Verbessertes Profile: " + compareableProfiles.improvedProfile);

        // Daten im Fenster anzeigen
        updateProfile(JSON.parse(data));

        // Bild Einfügen
        const imageInput = document.getElementById('profile-image-input');
        if (imageInput.files.length > 0) {
            const imageFile = imageInput.files[0];
            displayImagePreview(imageFile);
        }

        // Bewertungssystem vorbereiten
        thumbUp.removeEventListener("click", notYetReady);
        thumbDown.removeEventListener("click", notYetReady);
        ratingButton.removeEventListener("click", notYetReady);
        thumbUp.addEventListener("click", workingUp);
        thumbDown.addEventListener("click", workingDown);
        ratingButton.addEventListener("click", submitRating);

        // Bewertungsfeld anzeigen
        rating_div.style.display = "block";

    } catch (error) {
        console.error('Error beim kommunizieren mit dem Backend:', error);
        alert('Error beim kommunizieren mit dem Backend:', error);
    } finally {
        waitOverlay.style.display = 'none';
    }
}


// Methoden 
function workingUp() {
    selectedRating = 1;
    thumbUp.classList.add("selected");
    thumbDown.classList.remove("down-selected");
    ratingButton.classList.add("rated");
}

function workingDown() {
    selectedRating = 0;
    thumbDown.classList.add("down-selected");
    thumbUp.classList.remove("selected");
    ratingButton.classList.add("rated");
}


function notYetReady() {
    alert("Bitte verbessere zuerst dein Profil.")
}

// Submit rating to backend
async function submitRating() {
    if (selectedRating === null) {
        alert("Bitte wähle eine Bewertung aus bevor du sie abschickst.");
        return;
    }
    waitMessage.innerHTML = "Bitte warte während deine Bewertung hochgeladen wird...";
    waitOverlay.style.display = 'flex';

    const improvement_message = document.getElementById('improvement_message_input').value;

    if (improvement_message != null | "") {
        compareableProfiles.improvement_message = improvement_message;
    }

    try {
        const response = await fetch(url + "uploadResults", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                originalProfile: compareableProfiles.originalProfile,
                improvedProfile: compareableProfiles.improvedProfile,
                rating: selectedRating,
                improvement_message: compareableProfiles.improvement_message
            }),
        });

        const data = await response.json();
        if (debugLog) console.log("Bewertung erfolgreich hochgeladen:", data);
        rating_div.style.display = "none";
        ratingCompleted.style.display = "block";

    } catch (error) {
        console.error("Error beim Hochladen der Bewertung", error);
        alert("Error beim Hochladen der Bewertung:", error);
    } finally {
        waitOverlay.style.display = 'none';
    }
}