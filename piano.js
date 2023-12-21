document.addEventListener('DOMContentLoaded', function () {
            const context = new AudioContext();
            const pianoKeys = [
                220.00, 233.08, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33
            ];

            const keyMap = {
                '1': 0,
                '2': 1,
                '3': 2,
                '4': 3,
                '5': 4,
                '6': 5,
                '7': 6,
                '8': 7,
                '9': 8,
                '0': 9,
                '-': 10,
                '=': 11
            };

            const activeNotes = new Map(); // To keep track of active notes

            function playSound(note, keyIndex) {
                const oscillator = context.createOscillator();
                const gainNode = context.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.value = note;
                gainNode.connect(context.destination);
                oscillator.connect(gainNode);

                gainNode.gain.setValueAtTime(0, context.currentTime);
                gainNode.gain.linearRampToValueAtTime(1, context.currentTime + 0.1);
                gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 3);

                oscillator.start();
                oscillator.stop(context.currentTime + 3);

                // Update the color of the pressed key to a random color
                const keyElement = document.getElementById(`key-${keyIndex}`);
                const randomColor = getRandomColor();
                keyElement.style.backgroundColor = randomColor;

                return { oscillator, gainNode, keyElement };
            }

            function stopSound({ oscillator, gainNode, keyElement }) {
                const releaseTime = context.currentTime + 0.3; // Adjust the release time as needed

                // Smoothly transition from the current gain value to the fade-out value
                gainNode.gain.setValueAtTime(gainNode.gain.value, context.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.01, releaseTime);

                oscillator.stop(releaseTime);

                // Reset the color of the released key to its default color
                keyElement.style.backgroundColor = keyElement.classList.contains('black-key') ? 'black' : 'white';
            }

            function getRandomColor() {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }

            function createPiano() {
                const pianoContainer = document.getElementById('piano-container');
                const keyDownMap = new Map();

                pianoKeys.forEach(function (note, index) {
                    const keyElement = document.createElement('div');
                    keyElement.id = `key-${index}`; // Assign a unique ID to each key
                    keyElement.className = 'piano-key';
                    keyElement.style.backgroundColor = index % 7 === 1 || index % 7 === 4 ? 'black' : 'white';

                    if (index % 7 === 1 || index % 7 === 4) {
                        keyElement.className += ' black-key';
                    }

                    keyElement.addEventListener('mousedown', function () {
                        if (!keyDownMap.get(index)) {
                            activeNotes.set(index, playSound(note, index));
                            keyDownMap.set(index, true);
                        }
                    });

                    keyElement.addEventListener('mouseup', function () {
                        const activeNote = activeNotes.get(index);
                        if (activeNote) {
                            stopSound(activeNote);
                            activeNotes.delete(index);
                        }
                        keyDownMap.set(index, false);
                    });

                    document.addEventListener('keydown', function (event) {
                        const keyIndex = keyMap[event.key];
                        if (keyIndex !== undefined && !keyDownMap.get(keyIndex)) {
                            activeNotes.set(keyIndex, playSound(pianoKeys[keyIndex], keyIndex));
                            keyDownMap.set(keyIndex, true);
                        }
                    });

                    document.addEventListener('keyup', function (event) {
                        const keyIndex = keyMap[event.key];
                        if (keyIndex !== undefined) {
                            const activeNote = activeNotes.get(keyIndex);
                            if (activeNote) {
                                stopSound(activeNote);
                                activeNotes.delete(keyIndex);
                            }
                            keyDownMap.set(keyIndex, false);
                        }
                    });

                    pianoContainer.appendChild(keyElement);
                });
            }

            createPiano();
        });