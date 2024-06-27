document.addEventListener('DOMContentLoaded', function() {
    const results = JSON.parse(localStorage.getItem('quizResults'));
    const allQuestions = JSON.parse(localStorage.getItem('allQuestions'));
    if (!results || !allQuestions) {
        alert('No quiz results found.');
        return;
    }

    const { score, total, completionDate, wrongAnswers, questionMode, timer, timeUsed, practiceMode } = results;
    const percentage = Math.round((score / total) * 100);

    const progressCircle = document.getElementById('progressCircle');
    const progressText = document.getElementById('progressText');

    // Set the progress value
    progressCircle.style.setProperty('--progress', percentage);
    progressText.textContent = `${score} / ${total}`;

    // Display percentage and completion date
    document.getElementById('percentage').textContent = `${percentage}%`;
    document.getElementById('completionDate').textContent = new Date(completionDate).toLocaleDateString();

    // Helper function to normalize questions for comparison
    function normalize(text) {
        return text.replace(/\s+/g, ' ').trim().toLowerCase();
    }

    // Display wrong answers
    const wrongAnswersContainer = document.getElementById('wrongAnswers');
    if (wrongAnswers.length > 0) {
        wrongAnswersContainer.innerHTML = '<h4>Questions with Wrong Answers:</h4>';
        
        console.log('All Questions:', allQuestions);

        wrongAnswers.forEach((item, index) => {
            console.log(`Processing wrong answer: ${JSON.stringify(item)}`);
            const sanitizedQuestion = normalize(item.question);

            const questionDetails = allQuestions.find(q => normalize(q['Question']) === sanitizedQuestion);
            console.log(`Question details found: ${JSON.stringify(questionDetails)}`);

            if (questionDetails) {
                let optionsHTML = '';
                ['A', 'B', 'C', 'D', 'E', 'F'].forEach(option => {
                    if (questionDetails[option]) {
                        optionsHTML += `<p>${option}. ${questionDetails[option]}</p>`;
                    }
                });

                wrongAnswersContainer.innerHTML += `
                    <div class="wrong-answer mb-4">
                        <p><strong>Question ${index + 1}:</strong> ${item.question}</p>
                        <p><strong>Your Answer:</strong> ${item.userAnswer || 'No Answer'}</p>
                        <p><strong>Correct Answer:</strong> ${item.correctAnswer}</p>
                        <div><strong>Options:</strong></div>
                        ${optionsHTML}
                    </div>
                `;
            } else {
                console.log(`No question details found for: ${item.question}`);
                wrongAnswersContainer.innerHTML += `
                    <div class="wrong-answer mb-4">
                        <p><strong>Question ${index + 1}:</strong> ${item.question}</p>
                        <p><strong>Your Answer:</strong> ${item.userAnswer || 'No Answer'}</p>
                        <p><strong>Correct Answer:</strong> ${item.correctAnswer}</p>
                        <div><strong>Options:</strong> No details available</div>
                    </div>
                `;
            }
        });
    } else {
        wrongAnswersContainer.innerHTML = '<p>No wrong answers.</p>';
    }

    // Save the results in localStorage for the history page
    saveToHistory({
        fileName: localStorage.getItem('quizFileName'),
        date: new Date().toLocaleDateString(),
        score: score,
        total: total,
        percentage: percentage,
        questionMode: questionMode,
        timer: timer,
        timeUsed: timeUsed,
        practiceMode: practiceMode // Ensure practice mode is saved
    });
});

function goBack() {
    window.location.href = 'index.html';
}

function saveToHistory(result) {
    let history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    history.push(result);
    localStorage.setItem('quizHistory', JSON.stringify(history));
}
