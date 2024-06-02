let currentQuestionIndex = 0;
let currentQuestions = [];
let userAnswers = [];
let practicing = false; // Variable to track whether the user is practicing
let timerInterval; // Variable for the timer interval
let fileLoaded = false; // Variable to track if a file has been loaded

// Load the CSV file and start the quiz
window.loadCSV = async function () {
    const questionContainer = document.getElementById("questionContainer");
    questionContainer.innerHTML = "";
    const form = document.getElementById('csvForm');
    form.style.display = 'none'; // Hide the form after loading CSV

    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a CSV file.");
        return;
    }

    // Store the file name in localStorage
    localStorage.setItem('quizFileName', file.name);
    const fileName = file.name.replace(".csv", "");
    document.getElementById("fileNameTitle").innerText = fileName;

    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        const data = event.target.result;
        Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                currentQuestions = results.data;
                document.getElementById('questionModeForm').style.display = 'block'; // Show the question mode form
                fileLoaded = true; // Set fileLoaded to true
            },
            error: function (error) {
                console.error("CSV parsing error:", error);
                alert("Error parsing CSV file. Please check the file format.");
            },
        });
    };
    fileReader.onerror = function () {
        alert("Error reading the CSV file.");
    };
    fileReader.readAsText(file);
};

function goBack() {
    if (fileLoaded && !confirm("Are you sure you want to stop the test and go back?")) return;
    stopPractice();
    window.location.href = "./index.html";
}

function toggleModeOptions() {
    const mode = document.getElementById('modeSelect').value;
    document.getElementById('randomOptions').style.display = mode === 'random' ? 'block' : 'none';
    document.getElementById('rangeOptions').style.display = mode === 'range' ? 'block' : 'none';
}

function toggleRandomNumberOptions() {
    const randomOption = document.querySelector('input[name="randomOption"]:checked').value;
    document.getElementById('randomNumberOptions').style.display = randomOption === 'number' ? 'block' : 'none';
}

function toggleTimerOptions() {
    const timer = document.getElementById('timerSelect').value;
    document.getElementById('timerOptions').style.display = timer === 'set' ? 'block' : 'none';
}

function startPractice() {
    const mode = document.getElementById('modeSelect').value;

    if (mode === 'all') {
        currentQuestions = currentQuestions;
        generateQuestionNav(currentQuestions.length);
    } else if (mode === 'random') {
        const randomOption = document.querySelector('input[name="randomOption"]:checked').value;
        if (randomOption === 'number') {
            const count = parseInt(document.getElementById('randomCount').value, 10);
            if (isNaN(count) || count <= 0 || count > currentQuestions.length) {
                alert("Please enter a valid number of questions.");
                return;
            }
            currentQuestions = getRandomQuestions(currentQuestions, count);
        } else {
            currentQuestions = shuffleArray(currentQuestions);
        }
        generateQuestionNav(currentQuestions.length);
    } else if (mode === 'range') {
        const start = parseInt(document.getElementById('startQuestion').value, 10) - 1;
        const end = parseInt(document.getElementById('endQuestion').value, 10);
        if (isNaN(start) || isNaN(end) || start < 0 || end > currentQuestions.length || start >= end) {
            alert("Please enter a valid range of questions.");
            return;
        }
        currentQuestions = currentQuestions.slice(start, end);
        generateQuestionNav(currentQuestions.length);
    }

    const timerOption = document.getElementById('timerSelect').value;
    if (timerOption === 'set') {
        const minutes = parseInt(document.getElementById('timerMinutes').value, 10);
        if (isNaN(minutes) || minutes < 1) {
            alert("Please enter a valid number of minutes.");
            return;
        }
        localStorage.setItem('timerValue', `${minutes} minutes`); // Store the timer value
        startTimer(minutes);
    } else {
        localStorage.setItem('timerValue', 'No Timer'); // Store no timer
    }

    document.getElementById('questionModeForm').style.display = 'none'; // Hide the question mode form
    document.getElementById('navigationButtons').style.display = 'flex'; // Show the navigation buttons
    document.getElementById('submitQuizButton').style.display = 'block'; // Show the submit button

    // Save the start time
    localStorage.setItem('startTime', new Date().toISOString());

    displayQuestion(currentQuestionIndex);
    startPracticeMode();
}

function getRandomQuestions(questions, count) {
    const shuffled = shuffleArray(questions);
    return shuffled.slice(0, count);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startTimer(minutes) {
    const timerElement = document.getElementById('timer');
    timerElement.style.display = 'block';
    let timeRemaining = minutes * 60;

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert("Time is up! The quiz will be submitted automatically.");
            submitQuiz();
        }

        timeRemaining--;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer').style.display = 'none';
}

function startPracticeMode() {
    practicing = true;
}

function stopPractice() {
    practicing = false;
    document.getElementById('navigationButtons').style.display = 'none';
    stopTimer();
}

function generateQuestionNav(totalQuestions) {
    const questionNav = document.getElementById('questionNav');
    questionNav.innerHTML = '';
    for (let i = 0; i < totalQuestions; i++) {
        const button = document.createElement('button');
        button.className = 'nav-btn btn';
        button.innerText = i + 1;
        button.onclick = () => {
            updateUserAnswer();
            currentQuestionIndex = i;
            displayQuestion(currentQuestionIndex);
            updateQuestionNav();
        };
        questionNav.appendChild(button);
    }
    updateQuestionNav();
}

function updateQuestionNav() {
    const questionNav = document.getElementById('questionNav');
    const buttons = questionNav.children;
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        if (i === currentQuestionIndex) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
        if (userAnswers[i]) {
            button.classList.add('answered');
            button.classList.remove('incomplete');
        } else {
            button.classList.add('incomplete');
            button.classList.remove('answered');
        }
    }
}

function displayQuestion(index) {
    const questionContainer = document.getElementById("questionContainer");
    questionContainer.innerHTML = "";
    const question = currentQuestions[index];
    const questionElement = document.createElement('div');
    const questionType = question['Question Type'] || question['Question type'];
    questionElement.innerHTML = `<h5>Question ${index + 1} of ${currentQuestions.length}</h5>
                                 <p><strong>Question Type:</strong> ${questionType}</p>
                                 <p>${question['Question']}</p>`;
    const storedAnswer = userAnswers[index] || '';
    const storedAnswerArray = storedAnswer.split('');

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(option => {
        if (question[option]) {
            const checked = storedAnswerArray.includes(option) ? 'checked' : '';
            questionElement.innerHTML += `<label class="d-block"><input type="${questionType === 'Multiple-answer' ? 'checkbox' : 'radio'}" name="options" value="${option}" ${checked}> ${option}. ${question[option]}</label>`;
        }
    });

    questionContainer.appendChild(questionElement);

    const correctAnswer = question['Answer'];
    const isEncrypted = correctAnswer.length === 64 && /^[a-f0-9]{64}$/.test(correctAnswer);

    const showAnswerButton = document.getElementById('showAnswerButton');
    if (isEncrypted) {
        showAnswerButton.style.display = 'none';
    } else {
        showAnswerButton.style.display = 'block';
    }
}

function showAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const correctAnswer = question['Answer'];
    const isEncrypted = correctAnswer.length === 64 && /^[a-f0-9]{64}$/.test(correctAnswer);

    if (!isEncrypted) {
        const questionContainer = document.getElementById("questionContainer");

        // Check if the answer has already been shown
        if (!questionContainer.querySelector('.answer-shown')) {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer-shown'; // Add a class to mark the answer as shown
            answerElement.innerHTML = `<p class="text-success">Correct Answer: ${correctAnswer}</p>`;
            questionContainer.appendChild(answerElement);
        }
    }
}

async function submitQuiz() {
    const confirmation = confirm("Are you sure you want to submit the quiz?");
    if (!confirmation) {
        return;
    }

    updateUserAnswer();

    let score = 0;
    const wrongAnswers = [];
    const totalQuestions = currentQuestions.length;

    // Helper function to normalize answers for comparison
    function normalizeAnswer(answer) {
        return answer.toUpperCase().split('').sort().join('');
    }

    for (let i = 0; i < totalQuestions; i++) {
        const question = currentQuestions[i];
        const userAnswer = userAnswers[i] ? userAnswers[i] : '';
        const correctAnswer = question['Answer'];
        const isEncrypted = correctAnswer.length === 64 && /^[a-f0-9]{64}$/.test(correctAnswer);

        console.log(`Question ${i + 1}: User Answer - ${userAnswer}, Correct Answer - ${correctAnswer}, Encrypted - ${isEncrypted}`);

        let isCorrect = false;
        if (isEncrypted) {
            const sortedUserAnswer = normalizeAnswer(userAnswer);  // Sort the user answer before encrypting
            const encryptedUserAnswer = await window.electronAPI.hashAnswer(sortedUserAnswer);
            console.log(`Encrypted User Answer: ${encryptedUserAnswer}`);
            isCorrect = encryptedUserAnswer === correctAnswer;
        } else {
            const normalizedUserAnswer = normalizeAnswer(userAnswer);
            const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
            isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        }

        if (isCorrect) {
            score++;
        } else {
            wrongAnswers.push({
                question: question['Question'],
                userAnswer: userAnswer,
                correctAnswer: question['Answer']  // Store the correct answer from the original question
            });
        }
    }

    const results = {
        score: score,
        total: totalQuestions,
        wrongAnswers: wrongAnswers,
        completionDate: new Date().toISOString(),
        questionMode: document.getElementById('modeSelect').value,
        timer: localStorage.getItem('timerValue'),
        timeUsed: calculateTimeUsed()  // Add a function to calculate time used if applicable
    };

    console.log("Quiz Results:", results);

    // Store quiz results and all questions in localStorage
    localStorage.setItem('quizResults', JSON.stringify(results));
    localStorage.setItem('allQuestions', JSON.stringify(currentQuestions));

    window.location.href = './resultPage.html';
}


function calculateTimeUsed() {
    // Implement this function to calculate the time used if a timer is set
    const startTime = localStorage.getItem('startTime');
    if (startTime) {
        const endTime = new Date();
        const timeDiff = (endTime - new Date(startTime)) / 1000; // Convert to seconds
        const hours = Math.floor(timeDiff / 3600);
        const minutes = Math.floor((timeDiff % 3600) / 60);
        const seconds = Math.floor(timeDiff % 60);

        let timeUsed = '';
        if (hours > 0) {
            timeUsed += `${hours} hours `;
        }
        if (minutes > 0) {
            timeUsed += `${minutes} minutes `;
        }
        if (seconds > 0) {
            timeUsed += `${seconds} seconds`;
        }
        return timeUsed.trim();
    }
    return 'N/A';
}

function updateUserAnswer() {
    const questionType = currentQuestions[currentQuestionIndex]['Question Type'] || currentQuestions[currentQuestionIndex]['Question type'];
    if (questionType === 'Multiple-answer') {
        const selectedOptions = document.querySelectorAll('input[name="options"]:checked');
        const optionLetters = Array.from(selectedOptions).map(option => option.value).sort().join('');
        userAnswers[currentQuestionIndex] = optionLetters; // Store the selected answers for multiple-answer questions
        console.log(`Stored answers for question ${currentQuestionIndex + 1}: ${optionLetters}`);
    } else {
        const selectedOption = document.querySelector('input[name="options"]:checked');
        if (selectedOption) {
            const optionLetter = selectedOption.value;
            userAnswers[currentQuestionIndex] = optionLetter; // Store the selected answer for single-answer questions
            console.log(`Stored answer for question ${currentQuestionIndex + 1}: ${optionLetter}`);
        }
    }
    updateQuestionNav(); // Update the navigation buttons based on the current answers
}

function nextQuestion() {
    updateUserAnswer();
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
        updateQuestionNav();
    } else {
        // Notify the user they have reached the last question
        alert("You have reached the last question. Please review and submit your quiz.");
    }
}

function prevQuestion() {
    updateUserAnswer();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
        updateQuestionNav();
    } else {
        alert("This is the first question.");
    }
}
