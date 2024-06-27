let currentQuestionIndex = 0;
let currentQuestions = [];
let userAnswers = [];
let markedQuestions = [];
let filteredQuestions = [];
let practicing = false;
let examMode = false;
let timerInterval;
let fileLoaded = false;

window.loadCSV = async function () {
    const questionContainer = document.getElementById("questionContainer");
    questionContainer.innerHTML = "";
    const form = document.getElementById('csvForm');
    form.style.display = 'none';

    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a CSV file.");
        window.location.href = "./practicePage.html";
    }

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
                document.getElementById('questionModeForm').style.display = 'block';
                fileLoaded = true;
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
    const practiceMode = document.getElementById('practiceModeSelect').value;
    examMode = practiceMode === 'exam';

    const mode = document.getElementById('modeSelect').value;

    localStorage.setItem('practiceMode', practiceMode);


    if (mode === 'all') {
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
        localStorage.setItem('timerValue', `${minutes} minutes`);
        startTimer(minutes);
    } else {
        localStorage.setItem('timerValue', 'No Timer');
    }

    document.getElementById('questionModeForm').style.display = 'none';
    document.getElementById('navigationButtons').style.display = 'flex';
    document.getElementById('prevButton').style.display = 'none';
    document.getElementById('nextButton').style.display = 'inline-block';
    document.getElementById('submitQuizButton').style.display = 'block';

    localStorage.setItem('startTime', new Date().toISOString());

    currentQuestionIndex = 0;  // Reset to the first question
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

        // Disable button click in exam mode
        if (examMode) {
            button.disabled = true;
        } else {
            button.onclick = () => {
                updateUserAnswer();
                currentQuestionIndex = i;
                displayQuestion(currentQuestionIndex);
                updateQuestionNav();
            };
        }

        questionNav.appendChild(button);
    }
    updateQuestionNav();
}

function updateQuestionNav() {
    const questionNav = document.getElementById('questionNav');
    const buttons = questionNav.children;
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const questionIndex = parseInt(button.innerText) - 1; // Get the actual question index from the button text
        if (questionIndex === currentQuestionIndex) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
        if (userAnswers[questionIndex]) {
            button.classList.add('answered');
            button.classList.remove('incomplete');
        } else {
            button.classList.add('incomplete');
            button.classList.remove('answered');
        }
        if (markedQuestions.includes(questionIndex)) {
            button.style.backgroundColor = 'orange';
        } else {
            button.style.backgroundColor = ''; // Reset the color if not marked
        }
    }
}

function displayQuestion(index) {
    const questionContainer = document.getElementById("questionContainer");
    questionContainer.innerHTML = "";
    const question = currentQuestions[index];
    const questionType = question['Question Type'] || question['Question type'];
    const isMarked = markedQuestions.includes(index);

    let markIcon = '';
    if (!examMode) {
        markIcon = isMarked
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-bookmark-check-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5m8.854-9.646a.5.5 0 0 0-.708-.708L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-bookmark" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"/></svg>';
    }

    const questionElement = document.createElement('div');
    questionElement.innerHTML = `
        <h5>Question ${index + 1} of ${currentQuestions.length}</h5>
        <p><strong>Question Type:</strong> ${questionType}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <p>${question['Question']}</p>
            ${!examMode ? `<button class="mark-btn" onclick="markQuestion(${index})">${markIcon}</button>` : ''}
        </div>
    `;

    const storedAnswer = userAnswers[index] || '';
    const storedAnswerArray = storedAnswer.split('');

    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(option => {
        if (question[option]) {
            const checked = storedAnswerArray.includes(option) ? 'checked' : '';
            questionElement.innerHTML += `<label class="d-block"><input type="${questionType === 'Multiple-answer' ? 'checkbox' : 'radio'}" name="options" value="${option}" ${checked}> ${option}. ${question[option]}</label>`;
        }
    });

    questionContainer.appendChild(questionElement);

    const showAnswerButton = document.getElementById('showAnswerButton');
    if (showAnswerButton) {
        if (examMode) {
            showAnswerButton.style.display = 'none';
        } else {
            const correctAnswer = question['Answer'];
            const isEncrypted = correctAnswer.length === 64 && /^[a-f0-9]{64}$/.test(correctAnswer);
            showAnswerButton.style.display = isEncrypted ? 'none' : 'block';
        }
    }

    // Hide the Previous button if in exam mode
    document.getElementById('prevButton').style.display = examMode ? 'none' : 'inline-block';
}




function markQuestion(index) {
    if (markedQuestions.includes(index)) {
        markedQuestions = markedQuestions.filter(i => i !== index);
    } else {
        markedQuestions.push(index);
    }
    updateUserAnswer(); // Make sure the current answer is saved before redisplaying
    updateQuestionNav();
    displayQuestion(index);  // Update the question display to reflect the new mark status
}



function showAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const correctAnswer = question['Answer'];
    const isEncrypted = correctAnswer.length === 64 && /^[a-f0-9]{64}$/.test(correctAnswer);

    if (!isEncrypted) {
        const questionContainer = document.getElementById("questionContainer");

        if (!questionContainer.querySelector('.answer-shown')) {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer-shown';
            answerElement.innerHTML = `<p class="text-success">Correct Answer: ${correctAnswer}</p>`;
            questionContainer.appendChild(answerElement);
        }
    }
}

async function submitQuiz() {
    updateUserAnswer();
    const practiceMode = document.getElementById('practiceModeSelect').value;

    if (practiceMode === 'practice') {
        const unansweredQuestions = [];
        for (let i = 0; i < currentQuestions.length; i++) {
            if (!userAnswers[i] || markedQuestions.includes(i)) {
                unansweredQuestions.push(i);
            }
        }

        if (unansweredQuestions.length > 0) {
            const confirmation = confirm("There are marked or unanswered questions. Do you want to submit the quiz?");
            if (!confirmation) {
                generateQuestionNavFiltered(unansweredQuestions);
                currentQuestionIndex = unansweredQuestions[0];
                displayQuestion(currentQuestionIndex);
                return;
            }
        }
    }

    const confirmation = confirm("Are you sure you want to submit the quiz?");
    if (!confirmation) {
        return;
    }

    let score = 0;
    const wrongAnswers = [];
    const totalQuestions = currentQuestions.length;

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
            const sortedUserAnswer = normalizeAnswer(userAnswer);
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
                correctAnswer: question['Answer']
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
        timeUsed: calculateTimeUsed(),
        practiceMode: document.getElementById('practiceModeSelect').value
    };

    console.log("Quiz Results:", results);

    localStorage.setItem('quizResults', JSON.stringify(results));
    localStorage.setItem('allQuestions', JSON.stringify(currentQuestions));

    window.location.href = './resultPage.html';
}


function calculateTimeUsed() {
    const startTime = localStorage.getItem('startTime');
    if (startTime) {
        const endTime = new Date();
        const timeDiff = (endTime - new Date(startTime)) / 1000;
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
        userAnswers[currentQuestionIndex] = optionLetters;
        console.log(`Stored answers for question ${currentQuestionIndex + 1}: ${optionLetters}`);
    } else {
        const selectedOption = document.querySelector('input[name="options"]:checked');
        if (selectedOption) {
            const optionLetter = selectedOption.value;
            userAnswers[currentQuestionIndex] = optionLetter;
            console.log(`Stored answer for question ${currentQuestionIndex + 1}: ${optionLetter}`);
        }
    }
    updateQuestionNav();
}

function nextQuestion() {
    updateUserAnswer();

    const practiceMode = document.getElementById('practiceModeSelect').value;
    const selectedOption = document.querySelector('input[name="options"]:checked');

    if (examMode && !selectedOption) {
        alert("You must answer this question before moving to the next question.");
        return;
    }

    if (practiceMode === 'practice' && filteredQuestions.length > 0) {
        const currentIndex = filteredQuestions.indexOf(currentQuestionIndex);
        if (currentIndex < filteredQuestions.length - 1) {
            currentQuestionIndex = filteredQuestions[currentIndex + 1];
            displayQuestion(currentQuestionIndex);
            updateQuestionNav();
        } else {
            alert("You have reached the last question. Please review and submit your quiz.");
        }
    } else {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
            updateQuestionNav();
        } else {
            alert("You have reached the last question. Please review and submit your quiz.");
        }
    }
}


function prevQuestion() {
    updateUserAnswer();

    const practiceMode = document.getElementById('practiceModeSelect').value;
    if (practiceMode === 'practice' && filteredQuestions.length > 0) {
        const currentIndex = filteredQuestions.indexOf(currentQuestionIndex);
        if (currentIndex > 0) {
            currentQuestionIndex = filteredQuestions[currentIndex - 1];
            displayQuestion(currentQuestionIndex);
            updateQuestionNav();
        } else {
            alert("This is the first question.");
        }
    } else {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
            updateQuestionNav();
        } else {
            alert("This is the first question.");
        }
    }
}

function generateQuestionNavFiltered(filtered) {
    filteredQuestions = filtered;  // Update the global filteredQuestions array
    const questionNav = document.getElementById('questionNav');
    questionNav.innerHTML = '';
    filteredQuestions.forEach(i => {
        const button = document.createElement('button');
        button.className = 'nav-btn btn';
        button.innerText = i + 1;
        button.onclick = () => {
            updateUserAnswer();
            currentQuestionIndex = i;
            displayQuestion(currentQuestionIndex);
            updateQuestionNav();
        };
        if (userAnswers[i]) {
            button.classList.add('answered');
            button.classList.remove('incomplete');
        } else {
            button.classList.add('incomplete');
            button.classList.remove('answered');
        }
        if (markedQuestions.includes(i)) {
            button.style.backgroundColor = 'orange';
        }
        questionNav.appendChild(button);
    });
    updateQuestionNav();
}
