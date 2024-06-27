document.addEventListener('DOMContentLoaded', function() {
    const historyContainer = document.getElementById('historyContainer');
    const history = JSON.parse(localStorage.getItem('quizHistory')) || [];

    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item card';
        historyItem.innerHTML = `
            <div class="card-header" id="heading${index}" onclick="toggleCollapse(${index})">
                <div class="result-row">
                    <div class="result-item"><strong>${item.date}</strong></div>
                    <div class="result-item"><strong>${item.fileName}</strong></div>
                    <div class="result-item"><strong>Score: ${item.score} / ${item.total}</strong></div>
                    <div class="result-item"><strong>${item.percentage}%</strong></div>
                    <button class="delete-btn" onclick="confirmDelete(${index}, event)"><svg xmlns="./Icon/trash3.svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                  </svg></button>
                </div>
            </div>
            <div id="collapse${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#historyAccordion">
                <div class="card-body">
                    <div class="result-row">
                        <div class="result-item"><strong>Practice Mode:</strong> ${item.practiceMode || 'N/A'}</div>
                        <div class="result-item"><strong>Question Mode:</strong> ${item.questionMode || 'N/A'}</div>
                        <div class="result-item"><strong>Timer:</strong> ${item.timer || 'N/A'}</div>
                        <div class="result-item"><strong>Time Used:</strong> ${item.timeUsed || 'N/A'}</div>
                    </div>
                </div>
            </div>
        `;
        historyContainer.appendChild(historyItem);
    });
});

function toggleCollapse(index) {
    const collapseElement = document.getElementById(`collapse${index}`);
    collapseElement.classList.toggle('show');
}

function confirmDelete(index, event) {
    event.stopPropagation(); // Prevent the collapse toggle
    if (confirm("Are you sure you want to delete this history?")) {
        deleteHistory(index);
    }
}

function deleteHistory(index) {
    let history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('quizHistory', JSON.stringify(history));
    location.reload(); // Reload the page to reflect the changes
}

function goBack() {
    window.location.href = 'index.html';
}
