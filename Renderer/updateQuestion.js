let updateQuestions = [];
let currentPage = 1;
const itemsPerPage = 10;

window.loadUpdateCSV = function () {
    const updateTableContainer = document.getElementById('updateQuestionTableContainer');
    updateTableContainer.innerHTML = ''; // Clear existing table

    const updateFileInput = document.getElementById('updateCsvFile');
    const updateFile = updateFileInput.files[0];

    if (!updateFile) {
        alert('Please select a CSV file.');
        return;
    }

    const updateFileReader = new FileReader();

    updateFileReader.onload = function (event) {
        const data = event.target.result;

        Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                updateQuestions = results.data;
                displayUpdateTable(updateQuestions);
                document.getElementById('form-container').style.display = 'block';
                if (updateQuestions.length > 0) {
                    document.getElementById('exportCSVButton').style.display = 'block';
                }
                updatePagination();
            },
            error: function (error) {
                console.error('CSV parsing error:', error);
                alert('Error parsing CSV file. Please check the file format.');
            }
        });
    };

    updateFileReader.onerror = function (error) {
        console.error('File reading error:', error);
        alert('Error reading the CSV file. Please try again.');
    };

    updateFileReader.readAsText(updateFile);
};

//goBack function to index.html
function goBack() {
    // Navigate back to index.html
    window.location.href = "./updatePage.html";
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
    updateQuestions.push(newQuestion);

    // Update currentPage to the last page
    currentPage = Math.ceil(updateQuestions.length / itemsPerPage);
    displayUpdateTable(updateQuestions);
    updatePagination();
}

function displayUpdateTable(questions) {
    const updateTableContainer = document.getElementById('updateQuestionTableContainer');
    updateTableContainer.innerHTML = '';

    const formElement = document.createElement('form');
    formElement.id = 'updateForm';
    formElement.noValidate = true;

    const responsiveTableDiv = document.createElement('div');
    responsiveTableDiv.className = 'table-responsive';

    const updateTable = document.createElement('table');
    updateTable.className = 'table table-striped table-hover';

    const headerRow = updateTable.insertRow();
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
        const row = updateTable.insertRow();

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
        deleteButton.onclick = function () {
            deleteUpdateQuestion(index + start);
        };
        actionsCell.appendChild(deleteButton);
    });

    responsiveTableDiv.appendChild(updateTable);
    formElement.appendChild(responsiveTableDiv);
    updateTableContainer.appendChild(formElement);

    updatePaginationNumbers();
}

function deleteUpdateQuestion(index) {
    updateQuestions.splice(index, 1);

    // Update currentPage to the previous page if the current page is empty
    const totalPages = Math.ceil(updateQuestions.length / itemsPerPage);
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    displayUpdateTable(updateQuestions);
    updatePagination();

    if (updateQuestions.length === 0) {
        document.getElementById('exportCSVButton').style.display = 'none';
    }
}

function updatePagination() {
    const totalPages = Math.ceil(updateQuestions.length / itemsPerPage);

    document.getElementById('firstPage').disabled = currentPage === 1;
    document.getElementById('lastPage').disabled = currentPage === totalPages;
}

function updatePaginationNumbers() {
    const totalPages = Math.ceil(updateQuestions.length / itemsPerPage);
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
}

function changePage(page) {
    const totalPages = Math.ceil(updateQuestions.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayUpdateTable(updateQuestions);
}

document.getElementById('firstPage').addEventListener('click', () => {
    currentPage = 1;
    displayUpdateTable(updateQuestions);
    updatePagination();
});

document.getElementById('lastPage').addEventListener('click', () => {
    const totalPages = Math.ceil(updateQuestions.length / itemsPerPage);
    currentPage = totalPages;
    displayUpdateTable(updateQuestions);
    updatePagination();
});

function exportUpdateCSV() {
    const errorMessageDiv = document.getElementById('errorMessage');
    errorMessageDiv.style.display = 'none';

    const formElement = document.createElement('form');
    formElement.style.display = 'none';
    document.body.appendChild(formElement);

    let isValid = true;

    for (let i = 0; i < updateQuestions.length; i++) {
        const question = updateQuestions[i];

        if (!question['Question'] || !question['Answer'] || !question['A'] || !question['B']) {
            isValid = false;

            // Switch to the correct page and display validation messages
            currentPage = Math.ceil((i + 1) / itemsPerPage);
            displayUpdateTable(updateQuestions);

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

    const csvContent = Papa.unparse(updateQuestions, {
        columns: ['Question Type', 'Question', 'Answer', 'A', 'B', 'C', 'D', 'E', 'F']
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'updated_questions.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', function () {
    addNewQuestionRow(); // Add an initial empty row for user input
});
