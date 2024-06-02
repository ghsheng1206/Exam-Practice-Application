document.getElementById('encryptBtn').addEventListener('click', async function() {
    const fileInput = document.getElementById('csvFile');
    if (!fileInput.files.length) {
        alert('Please upload a CSV question file.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(event) {
        const text = event.target.result;
        const encryptedText = await encryptCsv(text);
        downloadEncryptedCsv(encryptedText);
    };

    reader.readAsText(file);
});

function goBack() {
    window.location.href = "./updatePage.html";
}

async function encryptCsv(csvText) {
    const rows = csvText.split('\n');
    const encryptedRows = await Promise.all(rows.map(async (row, index) => {
        if (index === 0) return row; // Assuming the first row contains headers
        const columns = row.split(',');
        if (columns.length > 2) {
            // Sort and convert the answer to uppercase before hashing
            const sortedAnswer = columns[2].toUpperCase().split('').sort().join('');
            columns[2] = await window.electronAPI.hashAnswer(sortedAnswer);
        }
        return columns.join(',');
    }));
    return encryptedRows.join('\n');
}

function downloadEncryptedCsv(encryptedCsv) {
    const blob = new Blob([encryptedCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'encrypted.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
