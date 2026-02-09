// main scanner logic here

let selectedFile = null;
let networkFlags = {
    high: null,
    medium: null,
    low: null
};

// load the flag files
async function loadFlags() {
    try {
        networkFlags.high = await fetch('flags/network/highrisk.json').then(r => r.json());
        networkFlags.medium = await fetch('flags/network/mediumrisk.json').then(r => r.json());
        networkFlags.low = await fetch('flags/network/lowrisk.json').then(r => r.json());
        console.log('Flags loaded successfully');
    } catch (error) {
        console.error('Error loading flags:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFlags();
    setupFileUpload();
});

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const scanBtn = document.getElementById('scanBtn');

    // upload button
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-gray-400');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-gray-400');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-gray-400');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // file input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // scan button
    scanBtn.addEventListener('click', () => {
        if (selectedFile) {
            scanFile(selectedFile);
        }
    });
}

function handleFileSelect(file) {
    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('scanBtn').classList.remove('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes? Reupload the file/upload a proper file.';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function scanFile(file) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = '<p class="text-center">scan in progress</p>';

    try { // checks file type - archive scan from archive (scan all files) file - scan the file itself kinda
        if (file.name.endsWith('.jar') || file.name.endsWith('.zip')) {
            await scanArchive(file);
        } else {
            await scanRegularFile(file);
        }
    } catch (error) { // might actually make proper error handling here instead of just showing the error message
        console.error('scan error (might not actually be scan itself):', error);
        resultsDiv.innerHTML = `<p class="text-red-600">error scanning file: ${error.message}</p>`;
    }
}

async function scanArchive(file) {
    const resultsDiv = document.getElementById('results');
    const arrayBuffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipData = await zip.loadAsync(arrayBuffer);
    
    let allMatches = {
        high: [],
        medium: [],
        low: []
    };

    // archive scanning method
    for (const [filename, zipEntry] of Object.entries(zipData.files)) {
        if (!zipEntry.dir) {
            try {
                const content = await zipEntry.async('string');
                const matches = checkPatterns(content);
                if (matches.high.length > 0 || matches.medium.length > 0 || matches.low.length > 0) {
                    allMatches.high.push(...matches.high.map(m => ({ file: filename, match: m })));
                    allMatches.medium.push(...matches.medium.map(m => ({ file: filename, match: m })));
                    allMatches.low.push(...matches.low.map(m => ({ file: filename, match: m })));
                }
            } catch (e) {
                // skip files that cant be read as text such as images or binaries
                // use the check for filetype from above/ make that a method and use it here aswell
                // instead of trying to make verything read as text
            }
        }
    }

    displayResults(allMatches); // dis results
}

async function scanRegularFile(file) {
    const resultsDiv = document.getElementById('results');
    const text = await file.text();
    const matches = checkPatterns(text);
    
    const allMatches = {
        high: matches.high.map(m => ({ file: file.name, match: m })),
        medium: matches.medium.map(m => ({ file: file.name, match: m })),
        low: matches.low.map(m => ({ file: file.name, match: m }))
    };

    displayResults(allMatches);
}

function checkPatterns(content) {
    const matches = {
        high: [],
        medium: [],
        low: []
    };

    if (!networkFlags.high || !networkFlags.medium || !networkFlags.low) {
        return matches;
    }

    // high risk pattern check
    ['strings', 'urls', 'protocols'].forEach(category => {
        if (networkFlags.high[category]) {
            networkFlags.high[category].forEach(pattern => {
                const regex = new RegExp(pattern, 'gi');
                const found = content.match(regex);
                if (found) {
                    matches.high.push(...found);
                }
            });
        }
    });

    // med
    ['strings', 'urls', 'protocols', 'suspicious_patterns'].forEach(category => {
        if (networkFlags.medium[category]) {
            networkFlags.medium[category].forEach(pattern => {
                const regex = new RegExp(pattern, 'gi');
                const found = content.match(regex);
                if (found) {
                    matches.medium.push(...found);
                }
            });
        }
    });

    // low
    ['strings', 'urls', 'protocols', 'generic_patterns'].forEach(category => {
        if (networkFlags.low[category]) {
            networkFlags.low[category].forEach(pattern => {
                const regex = new RegExp(pattern, 'gi');
                const found = content.match(regex);
                if (found) {
                    matches.low.push(...found);
                }
            });
        }
    });

    return matches; // returns the matches, might be ugly tho
}

function displayResults(matches) {
    const resultsDiv = document.getElementById('results');
    const totalHigh = matches.high.length;
    const totalMedium = matches.medium.length;
    const totalLow = matches.low.length;

    let html = '<div class="space-y-4">';
    
    // results summary
    html += '<div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">';
    html += '<h3 class="font-bold mb-2">Scan Results</h3>';
    html += `<p class="text-red-600 font-semibold">High Risk: ${totalHigh}</p>`;
    html += `<p class="text-yellow-600 font-semibold">Medium Risk: ${totalMedium}</p>`;
    html += `<p class="text-blue-600 font-semibold">Low Risk: ${totalLow}</p>`;
    html += '</div>';

    // matches for high risk
    if (totalHigh > 0) {
        html += '<div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">';
        html += '<h4 class="font-bold text-red-600 mb-2">High Risk Indicators</h4>';
        html += '<ul class="list-disc list-inside text-sm space-y-1">';
        matches.high.slice(0, 20).forEach(m => {
            html += `<li><span class="font-mono text-xs">${m.file}</span>: ${DOMPurify.sanitize(m.match)}</li>`;
        });
        if (totalHigh > 20) html += `<li>... and ${totalHigh - 20} more</li>`;
        html += '</ul></div>';
    }

    // med match
    if (totalMedium > 0) {
        html += '<div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">';
        html += '<h4 class="font-bold text-yellow-600 mb-2">Medium Risk Indicators</h4>';
        html += '<ul class="list-disc list-inside text-sm space-y-1">';
        matches.medium.slice(0, 20).forEach(m => {
            html += `<li><span class="font-mono text-xs">${m.file}</span>: ${DOMPurify.sanitize(m.match)}</li>`;
        });
        if (totalMedium > 20) html += `<li>... and ${totalMedium - 20} more</li>`;
        html += '</ul></div>';
    }

    // low matches
    if (totalLow > 0) {
        html += '<div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">';
        html += '<h4 class="font-bold text-blue-600 mb-2">Low Risk Indicators</h4>';
        html += '<ul class="list-disc list-inside text-sm space-y-1">';
        matches.low.slice(0, 20).forEach(m => {
            html += `<li><span class="font-mono text-xs">${m.file}</span>: ${DOMPurify.sanitize(m.match)}</li>`;
        });
        if (totalLow > 20) html += `<li>... and ${totalLow - 20} more</li>`;
        html += '</ul></div>';
    }

    html += '</div>';
    resultsDiv.innerHTML = html;
}

// update matches later perchance & add tria.ge implentation if possible in the future