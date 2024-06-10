let newFileQuestions = [];
let currentPage = 1;
const itemsPerPage = 10;

function goBack() {
    window.location.href = "./index.html";
}

function addNewQuestionRow() {
    const newQuestion = {
        'Question Type': 'Single-answer', // Default value
        'Question': '',
        'Answer': '',
        'A': '',
        'B': '',
        'C': '',
        'D': '',
        'E': '',
        'F': ''
    };
    newFileQuestions.push(newQuestion);

    // Update currentPage to the last page
    currentPage = Math.ceil(newFileQuestions.length / itemsPerPage);
    displayNewFileTable(newFileQuestions);
    updatePagination();

    // Show the export button if there is at least one question
    if (newFileQuestions.length > 0) {
        document.getElementById('exportCSVButton').style.display = 'block';
    }
}

function displayNewFileTable(questions) {
    const newFileTableContainer = document.getElementById('newFileQuestionTableContainer');
    newFileTableContainer.innerHTML = '';

    const responsiveTableDiv = document.createElement('div');
    responsiveTableDiv.className = 'table-responsive';

    const newFileTable = document.createElement('table');
    newFileTable.className = 'table table-striped table-hover';

    const headerRow = newFileTable.insertRow();
    const headers = ['Question Type', 'Question', 'Answer', 'Option A', 'Option B', 'Option C', 'Option D', 'Option E', 'Option F', 'Actions'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedQuestions = questions.slice(start, end);

    paginatedQuestions.forEach((question, index) => {
        const row = newFileTable.insertRow();

        const questionTypeCell = row.insertCell();
        const questionTypeSelect = document.createElement('select');
        questionTypeSelect.className = 'form-select editable';
        questionTypeSelect.innerHTML = `
            <option value="Single-answer" ${question['Question Type'] === 'Single-answer' ? 'selected' : ''}>Single-answer</option>
            <option value="True-false" ${question['Question Type'] === 'True-false' ? 'selected' : ''}>True-false</option>
            <option value="Multiple-answer" ${question['Question Type'] === 'Multiple-answer' ? 'selected' : ''}>Multiple-answer</option>
        `;
        questionTypeSelect.onchange = function () {
            question['Question Type'] = questionTypeSelect.value;
            const answerInput = row.cells[2].querySelector('input');

            if (questionTypeSelect.value === 'Single-answer' || questionTypeSelect.value === 'True-false') {
                answerInput.maxLength = 1; // Limit answer to one character
            } else {
                answerInput.removeAttribute('maxLength');
            }

            if (questionTypeSelect.value === 'True-false') {
                row.cells[3].querySelector('input').value = 'True';
                row.cells[4].querySelector('input').value = 'False';
                question['A'] = 'True';
                question['B'] = 'False';

                // Disable options C, D, E, and F
                options.slice(2).forEach(option => {
                    const cell = row.cells[options.indexOf(option) + 3];
                    const input = cell.querySelector('input');
                    input.value = '';
                    input.disabled = true;
                });
            } else {
                // Clear options A and B if not True-false
                row.cells[3].querySelector('input').value = '';
                row.cells[4].querySelector('input').value = '';
                question['A'] = '';
                question['B'] = '';

                // Enable options C, D, E, and F
                options.slice(2).forEach(option => {
                    const cell = row.cells[options.indexOf(option) + 3];
                    const input = cell.querySelector('input');
                    input.disabled = false;
                });
            }
        };
        questionTypeCell.appendChild(questionTypeSelect);

        const questionCell = row.insertCell();
        const questionInput = document.createElement('input');
        questionInput.type = 'text';
        questionInput.className = 'form-control editable';
        questionInput.required = true;
        questionInput.value = question['Question'] || '';
        questionInput.onblur = function () {
            question['Question'] = questionInput.value;
        };
        questionCell.appendChild(questionInput);

        const answerCell = row.insertCell();
        const answerInput = document.createElement('input');
        answerInput.type = 'text';
        answerInput.className = 'form-control editable';
        answerInput.required = true;
        answerInput.value = question['Answer'] || '';
        if (question['Question Type'] === 'Single-answer' || question['Question Type'] === 'True-false') {
            answerInput.maxLength = 1;
        }
        answerInput.onblur = function () {
            question['Answer'] = answerInput.value;
        };
        answerCell.appendChild(answerInput);

        const options = ['A', 'B', 'C', 'D', 'E', 'F'];
        options.forEach(option => {
            const optionCell = row.insertCell();
            const optionInput = document.createElement('input');
            optionInput.type = 'text';
            optionInput.className = 'form-control editable';
            optionInput.required = option === 'A' || option === 'B';
            optionInput.value = question[option] || '';
            optionInput.onblur = function () {
                question[option] = optionInput.value;
            };
            optionCell.appendChild(optionInput);
        });

        if (question['Question Type'] === 'True-false') {
            options.slice(2).forEach(option => {
                const cell = row.cells[options.indexOf(option) + 3];
                const input = cell.querySelector('input');
                input.value = '';
                input.disabled = true;
            });
        } else {
            options.slice(2).forEach(option => {
                const cell = row.cells[options.indexOf(option) + 3];
                const input = cell.querySelector('input');
                input.disabled = false;
            });
        }

        const actionsCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
            deleteQuestion(index + start);
        };
        actionsCell.appendChild(deleteButton);
    });

    responsiveTableDiv.appendChild(newFileTable);
    newFileTableContainer.appendChild(responsiveTableDiv);
    updatePaginationNumbers();
}

function deleteQuestion(index) {
    newFileQuestions.splice(index, 1);
    displayNewFileTable(newFileQuestions);
    updatePagination();

    if (newFileQuestions.length === 0) {
        document.getElementById('exportCSVButton').style.display = 'none';
    } else {
        document.getElementById('exportCSVButton').style.display = 'block';
    }
}

function updatePagination() {
    const totalPages = Math.ceil(newFileQuestions.length / itemsPerPage);

    document.getElementById('firstPage').disabled = currentPage === 1;
    document.getElementById('lastPage').disabled = currentPage === totalPages;
}

function updatePaginationNumbers() {
    const totalPages = Math.ceil(newFileQuestions.length / itemsPerPage);
    const paginationNumbers = document.getElementById('paginationNumbers');
    paginationNumbers.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-primary';
        button.textContent = i;
        button.onclick = () => changePage(i);
        if (i === currentPage) {
            button.classList.add('active');
        }
        paginationNumbers.appendChild(button);
    }

    // Ensure the first and last buttons are enabled/disabled correctly
    document.getElementById('firstPage').disabled = currentPage === 1;
    document.getElementById('lastPage').disabled = currentPage === totalPages;
}

function changePage(page) {
    const totalPages = Math.ceil(newFileQuestions.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayNewFileTable(newFileQuestions);
    updatePagination();
}

document.getElementById('firstPage').addEventListener('click', () => {
    currentPage = 1;
    displayNewFileTable(newFileQuestions);
    updatePagination();
});

document.getElementById('lastPage').addEventListener('click', () => {
    const totalPages = Math.ceil(newFileQuestions.length / itemsPerPage);
    currentPage = totalPages;
    displayNewFileTable(newFileQuestions);
    updatePagination();
});

function exportNewCSV() {
    const errorMessageDiv = document.getElementById('errorMessage');
    errorMessageDiv.style.display = 'none';

    const formElement = document.createElement('form');
    formElement.style.display = 'none';
    document.body.appendChild(formElement);

    let isValid = true;

    for (let i = 0; i < newFileQuestions.length; i++) {
        const question = newFileQuestions[i];

        if (!question['Question'] || !question['Answer'] || !question['A'] || !question['B']) {
            isValid = false;

            // Switch to the correct page and display validation messages
            currentPage = Math.ceil((i + 1) / itemsPerPage);
            displayNewFileTable(newFileQuestions);

            // Create temporary input elements to validate
            const tempQuestionInput = document.createElement('input');
            tempQuestionInput.type = 'text';
            tempQuestionInput.value = question['Question'] || '';
            tempQuestionInput.required = true;
            formElement.appendChild(tempQuestionInput);

            const tempAnswerInput = document.createElement('input');
            tempAnswerInput.type = 'text';
            tempAnswerInput.value = question['Answer'] || '';
            tempAnswerInput.required = true;
            formElement.appendChild(tempAnswerInput);

            const tempAInput = document.createElement('input');
            tempAInput.type = 'text';
            tempAInput.value = question['A'] || '';
            tempAInput.required = true;
            formElement.appendChild(tempAInput);

            const tempBInput = document.createElement('input');
            tempBInput.type = 'text';
            tempBInput.value = question['B'] || '';
            tempBInput.required = true;
            formElement.appendChild(tempBInput);

            // Trigger validation
            if (!tempQuestionInput.checkValidity()) {
                tempQuestionInput.reportValidity();
                tempQuestionInput.focus();
                break;
            }
            if (!tempAnswerInput.checkValidity()) {
                tempAnswerInput.reportValidity();
                tempAnswerInput.focus();
                break;
            }
            if (!tempAInput.checkValidity()) {
                tempAInput.reportValidity();
                tempAInput.focus();
                break;
            }
            if (!tempBInput.checkValidity()) {
                tempBInput.reportValidity();
                tempBInput.focus();
                break;
            }
        }
    }

    document.body.removeChild(formElement);

    if (!isValid) {
        errorMessageDiv.innerHTML = "Cannot export file, Question, Answer, Option A and Option B must be filled.";
        errorMessageDiv.style.display = 'block';
        return;
    }

    const csvContent = Papa.unparse(newFileQuestions, {
        columns: ['Question Type', 'Question', 'Answer', 'A', 'B', 'C', 'D', 'E', 'F']
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'new_questions.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', function() {
    addNewQuestionRow(); // Add an initial empty row for user input
    handleNewFileQuestionTypeChange();
});
