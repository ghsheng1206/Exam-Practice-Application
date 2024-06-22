document.getElementById('encryptBtn').addEventListener('click', async function() {
    const fileInput = document.getElementById('csvFile');
    const newFileNameInput = document.getElementById('newFileName');
    if (!fileInput.files.length) {
        alert('Please upload a CSV question file.');
        return;
    }
    if (!newFileNameInput.value.trim()) {
        alert('Please enter a new file name.');
        return;
    }

    const file = fileInput.files[0];
    const newFileName = newFileNameInput.value.trim();
    const reader = new FileReader();

    reader.onload = async function(event) {
        const text = event.target.result;
        const encryptedText = await encryptCsv(text);

        // Hash the entire encrypted file content
        const fileHash = await hashFile(encryptedText);

        // Download the encrypted file with the specified new file name
        downloadEncryptedCsv(encryptedText, newFileName);

        // Display the file name and hash
        displayFileHash(file.name, fileHash);

        // Store the file name and hash
        storeFileHash(file.name, newFileName, fileHash);
    };

    reader.readAsText(file);
});

function goBack() {
    window.location.href = "./updatePage.html";
}

async function encryptCsv(csvText) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: async function(results) {
                const data = results.data;
                for (let row of data) {
                    if (row['Answer']) {
                        // Normalize the answer: convert to uppercase and sort
                        const sortedAnswer = row['Answer'].toUpperCase().split('').sort().join('');
                        row['Answer'] = await window.electronAPI.hashAnswer(sortedAnswer);
                    }
                }
                const encryptedCsv = Papa.unparse(data);
                resolve(encryptedCsv);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

async function hashFile(fileContent) {
    const encoder = new TextEncoder();
    const data = encoder.encode(fileContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function downloadEncryptedCsv(encryptedCsv, newFileName) {
    const blob = new Blob([encryptedCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = newFileName.endsWith('.csv') ? newFileName : `${newFileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function displayFileHash(fileName, fileHash) {
    const hashDisplay = document.getElementById('fileHashDisplay');
    hashDisplay.innerHTML = `<p><strong>Original File Name:</strong> ${fileName}</p>
                             <p><strong>File Hash:</strong> ${fileHash}</p>`;
}

function storeFileHash(originalFileName, newFileName, fileHash) {
    const storedHashes = JSON.parse(localStorage.getItem('fileHashes')) || [];
    storedHashes.push({ originalFileName, newFileName, hash: fileHash });
    localStorage.setItem('fileHashes', JSON.stringify(storedHashes));
}
