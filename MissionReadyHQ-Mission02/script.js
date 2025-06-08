// ========================================
// VARIABLES 
// ========================================
let currentLesson = 1;
let completedLessons = 0; // Don't forget! Important for localStorage tracking
let selectedMatchItems = [];
let draggedElement = null;
let correctMatches = 0;
let completedLessonsList = []; // Array to track which specific lessons are completed. Also used in localStorage logic 

const totalLessons = 5;
const lesson1Answers = ["let", "const", "let", "0"];
const lesson4Answers = ["getElementById", "addEventListener", "click", "clicked"];

// ========================================
// FUNCTIONS
// ========================================
// Called when the page loads to initialise the progress bar or when a lesson is completed
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    // Qwik mafs
    const percentage = (completedLessons / totalLessons) * 100;
    
    // DOM manipulation to update progress bar
    progressFill.style.width = percentage + '%';
    progressText.textContent = `Progress: ${completedLessons} / ${totalLessons} lessons completed`; // Update text content using template literals
}

// Function to show a specific lesson by its number
// Hides all lessons and shows the one corresponding to lessonNumber
function showLesson(lessonNumber) {
    // Hide all lessons
    const lessons = document.querySelectorAll('.lesson');
    lessons.forEach(lesson => lesson.classList.remove('active'));
    
    // Show current lesson
    const currentLessonEl = document.getElementById(`lesson${lessonNumber}`);
    if (currentLessonEl) {
        currentLessonEl.classList.add('active');
    }
}

function checkLesson1Answers() {
    const blanks = document.querySelectorAll('#lesson1 .code-blank');
    let correctCount = 0;
    let allFilled = true;
    
    blanks.forEach((blank, index) => {
        const input = blank.querySelector('input');
        if (input) {
            const answer = input.value.toLowerCase().trim();
            const correctAnswer = lesson1Answers[index].toLowerCase();
            
            if (answer === correctAnswer) {
                correctCount++;
                blank.style.background = '#28a745';
            } else {
                blank.style.background = '#dc3545';
            }
        } else {
            allFilled = false;
        }
    });
    
    if (allFilled && correctCount === lesson1Answers.length) {
        showSuccess('success1');
        document.getElementById('nextLesson1').disabled = false;
        updateLiveOutput('output1', [
            '✅ let playerName = "Brendan";',
            '✅ const MAX_SCORE = 1000;', 
            '✅ let currentScore = 0;',
            '',
            'Great job! Your variables are correctly declared!'
        ]);
        return true;
    }
    return false;
}

function showSuccess(successId) {
    const successEl = document.getElementById(successId);
    successEl.classList.add('show');
}

function updateLiveOutput(outputId, lines) {
    const output = document.getElementById(outputId);
    output.innerHTML = '';
    
    lines.forEach((line, index) => {
        setTimeout(() => {
            const lineEl = document.createElement('div');
            lineEl.className = 'output-line';
            lineEl.textContent = line;
            output.appendChild(lineEl);
        }, index * 200);
    });
}

function setupDragAndDrop() {
    const draggableBlocks = document.querySelectorAll('.draggable-block');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    draggableBlocks.forEach(block => {
        block.addEventListener('dragstart', handleDragStart);
        block.addEventListener('dragend', handleDragEnd);
    });
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedElement) {
        // Get the data type expected by this drop zone
        const expectedType = this.getAttribute('data-expects');
        const blockType = draggedElement.getAttribute('data-type');
        
        // Check if this is correct block type for this zone
        if (blockType === expectedType) {
            this.innerHTML = '';
            this.appendChild(draggedElement);
            this.classList.add('correct');
            
            // Check if all drop zones have correct blocks
            checkAllDropZones();
        } else {
            this.classList.add('incorrect');
            setTimeout(() => {
                this.classList.remove('incorrect');
            }, 500);
        }
    }
}

// Function to check if all drop zones have correct blocks
function checkAllDropZones() {
    // Get drop zones for the current lesson only
    const currentLessonElement = document.getElementById(`lesson${currentLesson}`);
    if (!currentLessonElement) return false;
    
    const dropZones = currentLessonElement.querySelectorAll('.drop-zone');
    let allCorrect = true;
    
    // Check if all drop zones have the correct blocks
    dropZones.forEach(zone => {
        const child = zone.firstElementChild;
        if (!child || !child.classList.contains('draggable-block')) {
            allCorrect = false;
            return;
        }
        
        const expectedType = zone.getAttribute('data-expects');
        const blockType = child.getAttribute('data-type');
        
        if (expectedType !== blockType) {
            allCorrect = false;
        } else {
            // Mark as correct to show visual feedback
            zone.classList.add('correct');
        }
    });
    
    console.log(`All drop zones correct: ${allCorrect}`);
    
    if (allCorrect) {
        if (currentLesson === 2) {
            showSuccess('success2');
            document.getElementById('nextLesson2').disabled = false;
            updateLiveOutput('output2', [
                '✅ function greetPlayer(playerName) {',
                '✅     return "Hello, " + playerName + "!";',
                '✅ }',
                '',
                'Function works! Result: Hello, Brendan!'
            ]);
            return true;
        } else if (currentLesson === 5) {
            showSuccess('success5');
            document.getElementById('completePlayground').disabled = false;
            updateLiveOutput('output5', [
                '✅ for (let i = 0; i < 5; i++) {',
                '✅     console.log("Count: " + i);',
                '✅ }',
                '',
                'Count: 0',
                'Count: 1',
                'Count: 2',
                'Count: 3',
                'Count: 4'
            ]);
            return true;
        }
    }
    
    return false;
}

// Function to handle matching game
function setupMatchingGame() {
    const matchItems = document.querySelectorAll('.match-item');
    
    matchItems.forEach(item => {
        item.addEventListener('click', handleMatchItemClick);
    });
    
    // Check if all pairs are already matched (when returning to lesson 3)
    // Only check if we're not just after a reset
    if (correctMatches === 4 && completedLessons > 0) {
        markLessonAsCompleted(3);
    }
}

function handleMatchItemClick() {
    // If this item is already matched, do nothing
    if (this.classList.contains('correct')) return;
    
    // Add to selected items
    this.classList.add('selected');
    selectedMatchItems.push(this);
    
    // If we have 2 selected items, check if they match
    if (selectedMatchItems.length === 2) {
        const item1 = selectedMatchItems[0];
        const item2 = selectedMatchItems[1];
        
        // Check if items match by data-match attribute
        if (item1.getAttribute('data-match') === item2.getAttribute('data-match')) {
            // They match!
            item1.classList.remove('selected');
            item2.classList.remove('selected');
            item1.classList.add('correct');
            item2.classList.add('correct');
            correctMatches++;
            
            // Check if all matches are complete
            if (correctMatches === 4) { // 4 pairs in our game
                showSuccess('success3');
                document.getElementById('nextLesson3').disabled = false;
                updateLiveOutput('output3', [
                    '✅ All DOM methods matched correctly!',
                    '',
                    'Great job understanding DOM manipulation!'
                ]);
                
                // Mark lesson 3 as completed when all matching pairs are found
                markLessonAsCompleted(3);
            }
        } else {
            // They don't match
            item1.classList.add('incorrect');
            item2.classList.add('incorrect');
            
            // Reset after a short delay
            setTimeout(() => {
                item1.classList.remove('selected', 'incorrect');
                item2.classList.remove('selected', 'incorrect');
            }, 1000);
        }
        
        // Reset selected items
        selectedMatchItems = [];
    }
}

function checkLesson4Answers() {
    const blanks = document.querySelectorAll('#lesson4 .code-blank');
    let correctCount = 0;
    let allFilled = true;
    
    blanks.forEach((blank, index) => {
        const input = blank.querySelector('input');
        if (input) {
            const answer = input.value.toLowerCase().trim();
            const correctAnswer = lesson4Answers[index].toLowerCase();
            
            if (answer === correctAnswer) {
                correctCount++;
                blank.style.background = '#28a745';
            } else {
                blank.style.background = '#dc3545';
            }
        } else {
            allFilled = false;
        }
    });
    
    if (allFilled && correctCount === lesson4Answers.length) {
        showSuccess('success4');
        // document.getElementById('nextLesson4').disabled = false; // Only enable demoButton here
        document.getElementById('demoButton').disabled = false;
        
        updateLiveOutput('output4', [
            '✅ Event listener added successfully!',
            '✅ Try clicking the button below to test it.',
            '',
            'Great job understanding events!'
        ]);
        
        return true;
    }
    return false;
}

// Initialise code blanks for fill-in-the-blank exercises
function initCodeBlanks() {
    const blanks = document.querySelectorAll('.code-blank');
    
    blanks.forEach(blank => {
        blank.addEventListener('click', function() {
            // If there's already an input, don't add another one
            if (this.querySelector('input')) return;
            
            // Create an input field
            const input = document.createElement('input');
            input.className = 'code-input';
            input.type = 'text';
            input.value = '';
            
            // Add the input and focus it
            this.innerHTML = '';
            this.appendChild(input);
            input.focus();
            
            // Enable check button in the current lesson
            if (this.closest('#lesson1')) {
                document.getElementById('checkLesson1').disabled = false;
            } else if (this.closest('#lesson4')) {
                document.getElementById('checkLesson4').disabled = false;
            }
        });
    });
}

// Function to mark a lesson as completed
function markLessonAsCompleted(lessonNumber) {
    // Check if this lesson is already marked as completed
    if (!completedLessonsList.includes(lessonNumber)) {
        completedLessonsList.push(lessonNumber);
        completedLessons = completedLessonsList.length;
        updateProgress();
        updateTabsUI();
        
        // Store completed lessons in localStorage for persistence
        localStorage.setItem('completedLessons', JSON.stringify(completedLessonsList));
    }
}

// Event Listeners for buttons
function setupButtonListeners() {
    // Reset Progress button
    document.getElementById('resetProgressBtn').addEventListener('click', resetProgress);

    // Lesson 1 buttons
    document.getElementById('checkLesson1').addEventListener('click', function() {
        if (checkLesson1Answers()) {
            markLessonAsCompleted(1);
        }
    });
    
    document.getElementById('nextLesson1').addEventListener('click', function() {
        currentLesson = 2;
        showLesson(currentLesson);
        setupDragAndDrop();
    });
    
    // Lesson 2 buttons
    document.getElementById('testFunction').addEventListener('click', function() {
        const lessonDropZones = document.querySelectorAll('#lesson2 .drop-zone');
        
        // First check if all zones have blocks
        const allZonesHaveBlocks = Array.from(lessonDropZones).every(zone => 
            zone.firstElementChild && zone.firstElementChild.classList.contains('draggable-block')
        );
        
        if (!allZonesHaveBlocks) {
            updateLiveOutput('output2', ['❌ Complete the function by dragging all blocks first!']);
            return;
        }
        
        // Now check if they're the correct blocks
        const result = checkAllDropZones();
        if (result) {
            markLessonAsCompleted(2);
        } else {
            // They have blocks but some are wrong
            updateLiveOutput('output2', ['❌ Some blocks are in the wrong position. Check your function structure!']);
            
            // Highlight incorrect placements
            lessonDropZones.forEach(zone => {
                const expectedType = zone.getAttribute('data-expects');
                const child = zone.firstElementChild;
                if (child) {
                    const blockType = child.getAttribute('data-type');
                    if (expectedType !== blockType) {
                        zone.classList.add('incorrect');
                        setTimeout(() => {
                            zone.classList.remove('incorrect');
                        }, 1000);
                    }
                }
            });
        }
    });
    
    document.getElementById('nextLesson2').addEventListener('click', function() {
        currentLesson = 3;
        showLesson(currentLesson);
        setupMatchingGame();
    });
    
    // Lesson 3 buttons
    document.getElementById('nextLesson3').addEventListener('click', function() {
        currentLesson = 4;
        showLesson(currentLesson);
    });
    
    // Lesson 4 buttons
    document.getElementById('checkLesson4').addEventListener('click', function() {
        if (checkLesson4Answers()) {
            markLessonAsCompleted(4);
        }
    });
    // Enable "Final Lesson" button only after demoButton is clicked
    document.getElementById('demoButton').addEventListener('click', function() {
        document.getElementById('nextLesson4').disabled = false;
        // Mark lesson 4 as completed when demo button is clicked
        markLessonAsCompleted(4);
    });
    document.getElementById('nextLesson4').addEventListener('click', function() {
        currentLesson = 5;
        showLesson(currentLesson);
        setupDragAndDrop(); // Reuse for the loop construction
    });
    
    // Lesson 5 buttons
    document.getElementById('runLoop').addEventListener('click', function() {
        const lessonDropZones = document.querySelectorAll('#lesson5 .drop-zone');
        
        // First check if all zones have blocks
        const allZonesHaveBlocks = Array.from(lessonDropZones).every(zone => 
            zone.firstElementChild && zone.firstElementChild.classList.contains('draggable-block')
        );
        
        if (!allZonesHaveBlocks) {
            updateLiveOutput('output5', ['❌ Complete the loop by dragging all blocks first!']);
            return;
        }
        
        // Now check if they're the correct blocks
        const result = checkAllDropZones();
        if (result) {
            // Mark this lesson as completed
            markLessonAsCompleted(5);
            
            // Check if all lessons are completed
            checkAllLessonsCompleted();
        } else {
            // They have blocks but some are wrong
            updateLiveOutput('output5', ['❌ Some blocks are in the wrong position. Check your loop structure!']);
            
            // Highlight incorrect placements
            lessonDropZones.forEach(zone => {
                const expectedType = zone.getAttribute('data-expects');
                const child = zone.firstElementChild;
                if (child) {
                    const blockType = child.getAttribute('data-type');
                    if (expectedType !== blockType) {
                        zone.classList.add('incorrect');
                        setTimeout(() => {
                            zone.classList.remove('incorrect');
                        }, 1000);
                    }
                }
            });
        }
    });
    
    document.getElementById('completePlayground').addEventListener('click', function() {
        // Check if all lessons are truly completed
        if (completedLessons < 5) {
            alert('Please complete all 5 lessons before finishing the playground!');
            return;
        }
        
        // Show completion screen
        showLesson('completion');
        
        // Trigger confetti celebration
        createConfetti();
    });
}

// Function to handle navigation between lessons
function navigateToLesson(lessonNumber) {
    // Update the current lesson
    currentLesson = lessonNumber;
    
    // Show the selected lesson
    showLesson(lessonNumber);
    
    // Update the tab UI
    updateTabsUI();
    
    // Initialise specific lesson functionality if needed and check for completion
    if (lessonNumber === 2 || lessonNumber === 5) {
        setupDragAndDrop();
        
        // Only check completion status if we're not immediately after a reset
        // The completedLessons count will be 0 immediately after a reset
        if (completedLessons > 0) {
            // Check if lesson 2 is already completed by checking drop zones
            if (lessonNumber === 2) {
                const result = checkAllDropZones();
                if (result) {
                    markLessonAsCompleted(2);
                }
            }
            
            // Check if lesson 5 is already completed by checking drop zones
            if (lessonNumber === 5) {
                const result = checkAllDropZones();
                if (result) {
                    markLessonAsCompleted(5);
                }
            }
        }
    } else if (lessonNumber === 3) {
        setupMatchingGame();
        
        // Lesson 3 matching game completion is checked in setupMatchingGame
    } else if (lessonNumber === 4) {
        // For lesson 4, check if all inputs have correct answers
        const correctAnswersCount = document.querySelectorAll('#lesson4 .code-blank').length;
        const correctInputs = document.querySelectorAll('#lesson4 .code-blank[style*="background: rgb(40, 167, 69)"]').length;
        
        if (correctInputs === correctAnswersCount && correctAnswersCount > 0) {
            markLessonAsCompleted(4);
        }
    }
}

// Function to check if a specific lesson is completed
function isLessonCompleted(lessonNumber) {
    // Check if this specific lesson is in our completed list
    return completedLessonsList.includes(lessonNumber);
}

// Function to check if all lessons are completed and update UI
function checkAllLessonsCompleted() {
    // Check if all 5 lessons are completed
    const allCompleted = [1, 2, 3, 4, 5].every(lesson => completedLessonsList.includes(lesson));
    
    if (allCompleted) {
        updateProgress();
        updateTabsUI();
    }
}

// Function to update the tab UI based on completed lessons
function updateTabsUI() {
    // Get all the tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // Remove active class from all tabs
    tabButtons.forEach((btn, index) => {
        btn.classList.remove('active');
        
        // Mark completed lessons based on our completed lessons list
        const lessonNumber = index + 1; // Convert index to lesson number (1-based)
        if (completedLessonsList.includes(lessonNumber)) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
    });
    
    // Add active class to the current tab
    if (currentLesson >= 1 && currentLesson <= 5) {
        tabButtons[currentLesson - 1].classList.add('active');
    }
}

/**
 * Reset all progress and UI to the initial state.
 */
function resetProgress() {
    // Clear lesson completion state
    completedLessonsList = [];
    completedLessons = 0;
    localStorage.removeItem('completedLessons');

    // Reset progress bar and tabs
    updateProgress();
    updateTabsUI();

    // Reset all lessons UI
    for (let i = 1; i <= totalLessons; i++) {
        // Hide all lessons except lesson 1
        const lessonEl = document.getElementById(`lesson${i}`);
        if (lessonEl) {
            lessonEl.classList.remove('active');
            // Hide success messages
            const successMsg = lessonEl.querySelector('.success-message');
            if (successMsg) successMsg.classList.remove('show');
            // Reset code blanks
            const blanks = lessonEl.querySelectorAll('.code-blank');
            blanks.forEach(blank => {
                blank.innerHTML = '___';
                blank.style.background = '';
            });
            // Reset inputs
            const inputs = lessonEl.querySelectorAll('input.code-input');
            inputs.forEach(input => input.value = '');
            // Reset drop zones
            const dropZones = lessonEl.querySelectorAll('.drop-zone');
            dropZones.forEach(zone => {
                // First check if there's a draggable block inside and move it back to code blocks
                const draggableBlock = zone.querySelector('.draggable-block');
                if (draggableBlock) {
                    // Find the code blocks container to move it back to
                    const codeBlocksContainer = lessonEl.querySelector('.code-blocks:first-child');
                    if (codeBlocksContainer) {
                        codeBlocksContainer.appendChild(draggableBlock);
                    }
                }
                
                // Now reset the drop zone content
                if (lessonEl.id === 'lesson2') {
                    // All drop zones in lesson 2 get the same generic placeholder
                    zone.innerHTML = 'Drop code block here';
                } else if (lessonEl.id === 'lesson5') {
                    // All drop zones in lesson 5 get the same generic placeholder
                    zone.innerHTML = 'Drop code segment here';
                } else {
                    zone.innerHTML = 'Drop item here';
                }
                
                zone.classList.remove('correct', 'incorrect', 'drag-over');
            });
            // Reset matching game
            const matchItems = lessonEl.querySelectorAll('.match-item');
            matchItems.forEach(item => {
                item.classList.remove('selected', 'correct', 'incorrect');
            });
            // Reset live outputs
            const liveOutputs = lessonEl.querySelectorAll('.live-output');
            liveOutputs.forEach(output => output.innerHTML = '');
            // Reset controls
            const controls = lessonEl.querySelectorAll('.controls button');
            controls.forEach(btn => {
                if (btn.id.startsWith('nextLesson') || btn.id === 'checkLesson1' || btn.id === 'checkLesson4' || btn.id === 'testFunction' || btn.id === 'runLoop' || btn.id === 'completePlayground' || btn.id === 'demoButton') {
                    btn.disabled = btn.id !== 'testFunction' && btn.id !== 'runLoop';
                }
            });
        }
    }

    // Reset lesson-specific state
    currentLesson = 1;
    correctMatches = 0;
    selectedMatchItems = [];
    draggedElement = null;

    // Reset hint buttons and hide all hints/answers
    for (let i = 1; i <= totalLessons; i++) {
        const hintBtn = document.getElementById(`hintBtn${i}`);
        if (hintBtn) hintBtn.disabled = false;
        const stages = hintStages[i];
        if (stages) {
            stages.forEach(stageId => {
                const el = document.getElementById(stageId);
                if (el) el.style.display = stageId.endsWith('-2') || stageId.startsWith('answer') ? 'none' : '';
            });
        }
        hintIndex[i] = 0;
    }

    // Show lesson 1
    showLesson(1);
    updateTabsUI();
    updateProgress();
    initCodeBlanks();
}

// Initialise everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Try to load any previously completed lessons from localStorage
    const storedLessons = localStorage.getItem('completedLessons');
    if (storedLessons) {
        try {
            const parsed = JSON.parse(storedLessons);
            if (Array.isArray(parsed)) {
                completedLessonsList = parsed;
                completedLessons = completedLessonsList.length;
            }
        } catch (e) {
            console.error('Failed to parse stored lessons:', e);
        }
    }
    
    // Initialise the playground
    updateProgress();
    showLesson(currentLesson);
    initCodeBlanks();
    setupButtonListeners();
    updateTabsUI();
});

// Hint cycling logic for all lessons
const hintStages = {
    1: ['hint1',   'hint1-2',   'answer1'],
    2: ['hint2',   'hint2-2',   'answer2'],
    3: ['hint3',   'hint3-2',   'answer3'],
    4: ['hint4',   'hint4-2',   'answer4'],
    5: ['hint5',   'hint5-2',   'answer5']
};
  
const hintIndex = {};
  
function showNextHint(lesson) {
    const stages = hintStages[lesson];
    if (!stages) return;
  
    const idx = hintIndex[lesson] || 0;
  
    // hide the previous hint (if any)
    if (idx > 0) {
        document.getElementById(stages[idx - 1]).style.display = 'none';
    }
  
    // reveal the current hint or answer
    document.getElementById(stages[idx]).style.display = 'block';
  
    // advance to next stage
    hintIndex[lesson] = idx + 1;
  
    // disable the hint button once we're past the last stage
    if (hintIndex[lesson] >= stages.length) {
        document.getElementById(`hintBtn${lesson}`).disabled = true;
    }
}

function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#277da1'];
    
    // Create confetti pieces
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 2-5 seconds
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after animation completes
    setTimeout(() => {
        document.body.removeChild(confettiContainer);
    }, 7000);
}