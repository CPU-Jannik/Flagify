async function loadFlags() {
    try {
        const response = await fetch('flags.json');
        const data = await response.json();
        const flagGrid = document.getElementById('grid');

        // Sort flags alphabetically by name
        data.flags.sort((a, b) => a.name.localeCompare(b.name));

        // Load the actual SVG content for each flag
        const flagsWithSvgContent = await Promise.all(data.flags.map(async (flag) => {
            try {
                const svgResponse = await fetch(flag.svg);
                const svgContent = await svgResponse.text();
                return { ...flag, svgContent };
            } catch (error) {
                console.error(`Error loading SVG for ${flag.name}:`, error);
                return { ...flag, svgContent: null };
            }
        }));

        // Store the flags data globally so we can use it for searching
        window.flagsData = flagsWithSvgContent;
        
        // Initial render of all flags
        renderFlags(flagsWithSvgContent);

        // Add search input listener
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredFlags = window.flagsData.filter(flag => 
                flag.name.toLowerCase().includes(searchTerm) || 
                flag.code.toLowerCase().includes(searchTerm)
            );
            renderFlags(filteredFlags);
        });

    } catch (error) {
        console.error('Fehler beim Laden:', error);
        document.getElementById('grid').innerHTML = `
            <p>Fehler beim Laden der Flaggen: ${error.message}</p>
        `;
    }
}

function renderFlags(flags) {
    const flagGrid = document.getElementById('grid');
    const flagsHTML = flags.map(flag => `
        <div class="flag-item">
            <div class="flex gap-4"> 
            <p class="text-color text-line">${flag.code} · ${flag.name}</p>
            </div>

            <img loading="lazy" src="${flag.svg}">
            <div class="flex gap-8">
                <button class="button copy-btn" data-svg="${flag.svgContent ? flag.svgContent.replace(/"/g, '&quot;') : ''}" data-name="${flag.name}">
                    <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0a1a1a" viewBox="0 0 256 256">
                        <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32Zm-8,128H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
                    </svg>
                    <svg class="copied-icon" style="display:none;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#55884e" viewBox="0 0 256 256">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                    </svg>
                    SVG
                </button>
                <button class="button download-btn" data-svg="${flag.svgContent ? flag.svgContent.replace(/"/g, '&quot;') : ''}" data-name="${flag.name}">
                    <svg class="download-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#1a1a1a" viewBox="0 0 256 256">
                        <path d="M72,40a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,40Zm159.39,92.94A8,8,0,0,0,224,128H184V104a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v24H32a8,8,0,0,0-5.66,13.66l96,96a8,8,0,0,0,11.32,0l96-96A8,8,0,0,0,231.39,132.94ZM80,80h96a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16Z"></path>
                    </svg>
                    SVG
                </button>
            </div>
        </div>
    `).join('');

    // Remove old event listeners before updating innerHTML
    flagGrid.replaceWith(flagGrid.cloneNode(true));
    
    // Get the new grid reference after cloning
    const newFlagGrid = document.getElementById('grid');
    newFlagGrid.innerHTML = flagsHTML;

    // Add event listeners to the new grid
    setupEventListeners(newFlagGrid);
}

function setupEventListeners(flagGrid) {
    flagGrid.addEventListener('click', (event) => {
        const copyBtn = event.target.closest('.copy-btn');
        const downloadBtn = event.target.closest('.download-btn');

        if (copyBtn) {
            handleCopyButton(copyBtn);
        }

        if (downloadBtn) {
            handleDownloadButton(downloadBtn);
        }
    });
}

function handleCopyButton(copyBtn) {
    const svgCode = copyBtn.dataset.svg;
    const copyIcon = copyBtn.querySelector('.copy-icon');
    const copiedIcon = copyBtn.querySelector('.copied-icon');

    navigator.clipboard.writeText(svgCode).then(() => {
        copyIcon.style.display = 'none';
        copiedIcon.style.display = 'inline-block';

        setTimeout(() => {
            copyIcon.style.display = 'inline-block';
            copiedIcon.style.display = 'none';
        }, 2000);
    });
}

function handleDownloadButton(downloadBtn) {
    const svgCode = downloadBtn.dataset.svg;
    const name = downloadBtn.dataset.name;
    
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_flag.svg`;
    link.click();
    
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', loadFlags);

function toggleMenu() {
    const menu = document.querySelector('.menu');
    menu.classList.toggle('active');
    
    // Optional: Ändere auch das Aussehen des Buttons
    const modalBtn = document.querySelector('.modal-btn');
    const modalBtnClose = document.querySelector('.modal-btn.close');
    
    modalBtn.classList.toggle('active');
    modalBtnClose.classList.toggle('active');
}