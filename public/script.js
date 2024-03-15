// The code was written by NianCode.
// pt-br: Código escrito por NianCode.
// Email: nicolash.contato@gmail.com

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { collection, query, orderBy, limit, getDocs, addDoc, getFirestore, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

document.addEventListener('DOMContentLoaded', function () {
    // Variables for game elements
    const hitboxMario = document.querySelector('.hitboxMario'); // Hitbox of Mario
    const mario = document.querySelector('.mario'); // Mario element
    const hitboxEnemy = document.querySelector('.hitboxInimigo'); // Hitbox of the enemy
    const enemy = document.querySelector('.inimigo'); // Enemy element
    const screen = document.querySelector('section'); // Game screen
    const points = document.querySelector('.pontos'); // Points counter
    const pointsMenu = document.querySelector('.pontosMenu'); // Points counter in the menu
    const container = document.querySelector('.container'); // Main container
    const menu = document.querySelector('.menu'); // Menu
    const ranking = document.querySelector('.containerRanking'); // Ranking container
    const btnRestart = document.querySelector('.btnRestart'); // Restart button
    const clouds1 = document.querySelector('#nuvens1'); // Clouds
    const clouds2 = document.querySelector('#nuvens2'); // Clouds
    // Game state variables
    var scoreCounter = 0; // Initial value of the score counter
    var loop; // Loop variable
    var randomNum = 0 // Number that defines the chance of the enemy being airborne or not
    var enemyPos = 800 // Initial position of the enemy
    var cloudPos = 800; // Initial position of the first cloud
    var cloudPos2 = 1600; // Initial position of the second cloud
    var cloudSpeed = 1; // Initial speed of the clouds
    var enemySpeed = 5 // Initial speed of the enemy
    var airborneEnemy = false // Value to check if the enemy is airborne or not
    var big = true // Value to check if the character is big or not
    var alive = true; // Value to check if the character is alive or not
    var jumpStart = null // Value to check if the character is jumping or not
    var jumpDistance = 120   // Jump distance
    var jumpDuration = 500 // Jump duration
    var fastFall = false; // Value to check if the character is falling fast or not

    // Web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCNBM1yPYmRRui4Ba1Vv-Zk9VSaW0e2RbY",
        authDomain: "nian-code.firebaseapp.com",
        projectId: "nian-code",
        storageBucket: "nian-code.appspot.com",
        messagingSenderId: "388387613829",
        appId: "1:388387613829:web:7bfc12a7e1281ec4884dec",
        measurementId: "G-66WXRDSMY8"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const db = getFirestore(app);


    document.getElementById('saveButton').onclick = function () {
        // Leia o nome do jogador do campo de entrada
        if (localStorage.getItem('scoreSaved')) {
            alert('Você já salvou sua pontuação.');
            return;
        }

        let playerName = document.getElementById('playerName').value;

        // Verifique se o nome do jogador contém apenas letras e números e tem entre 2 e 5 caracteres
        let regex = /^[a-zA-Z0-9]{2,5}$/;
        if (!regex.test(playerName)) {
            alert('O nome do jogador deve conter apenas letras e números e ter entre 2 e 5 caracteres.');
            return;
        }

        // Escreva o nome do jogador e a pontuação no Firestore
        addDoc(collection(db, "scores"), {
            name: playerName,
            score: scoreCounter
        })
            .then(() => {
                localStorage.setItem('scoreSaved', 'true');
            })
            .catch((error) => {
                console.error("Erro ao salvar pontuação: ", error);
            });
    };
    const scoresQuery = query(collection(db, "scores"), orderBy("score", "desc"), limit(50));
    const unsubscribe = onSnapshot(scoresQuery,
        (querySnapshot) => {
            // Limpe a lista de ranking antes de adicionar as novas pontuações
            let rankingTable = document.getElementById('ranking');
            rankingTable.innerHTML = '';
            let rank = 1;
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                // Crie um novo elemento de linha para cada pontuação
                let row = document.createElement('tr');
                // Crie um elemento de célula para a posição, o nome e a pontuação
                let rankCell = document.createElement('td');
                let nameCell = document.createElement('td');
                let scoreCell = document.createElement('td');
                // Crie um elemento div para o nome
                let nameDiv = document.createElement('div');
                // Defina o conteúdo das células
                rankCell.textContent = String(rank).padStart(2, '0');;
                nameDiv.textContent = data.name;
                scoreCell.textContent = data.score;
                // Adicione o div ao nameCell
                nameCell.appendChild(nameDiv);
                // Adicione as células à linha
                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(scoreCell);
                // Adicione a linha à tabela de ranking
                rankingTable.appendChild(row);
                rank++;
            });
        },
        (error) => {
            console.error("Error listening to score updates: ", error);
        }
    );

    // Object with character information for reset
    const originalCharacters = {
        marioBottom: +window.getComputedStyle(hitboxMario).bottom.replace('px', ''),
        marioAnimation: hitboxMario.style.animation
    };

    function Shrink() {
        if (big == true) {
            mario.src = './imagens/personagem/mario_mini.gif';
            mario.style.width = '70px';
            mario.style.height = '70px';
            mario.style.right = '0px';
            hitboxMario.style.height = '50px';
            big = false;
        }
    }

    var KeyDownEvent = function (event) {
        if ((event.key == ' ' || event.key == 'w' || event.key == 'ArrowUp' || event.key == "Enter") && jumpStart === null) {
            window.requestAnimationFrame(jump);
            screen.classList.add('efeitoPulo');
        }
        if (alive == true && big == true) {
            if (event.key == 'ArrowDown' || event.key == 's' || event.key == 'Shift') {
                Shrink();
                if (jumpStart !== null) {
                    fastFall = true;
                }
            }
        }
    };

    // Game initialization when the page loads
    function init() {
        localStorage.removeItem('scoreSaved');
        alive = true;
        fastFall = false;
        StartLoop();
        document.addEventListener('keydown', KeyDownEvent);
        document.addEventListener('keyup', KeyUpEvent);
        scoreCounter = 0;
        enemySpeed = 5;
        enemyPos = 800;
        points.innerHTML = scoreCounter.toString().padStart(4, '0');
        pointsMenu.innerHTML = scoreCounter.toString().padStart(4, '0');
        ResetCharacters();
        screen.classList.remove('menuAnimation');
        container.classList.remove('menuAnimation2');
        container.style.display = 'none';
        points.style.display = 'inline';
    }

    // Reset characters to their initial position
    function ResetCharacters() {
        alive = true;
        fastFall = false;
        enemyPos = 800;
        hitboxEnemy.style.left = '800px';
        hitboxMario.style.animation = originalCharacters.marioAnimation;
        hitboxMario.style.bottom = `${originalCharacters.marioBottom}px`;
        hitboxMario.style.height = '';
        big = true;
        airborneEnemy = false;
        enemy.src = "./imagens/inimigo/cano.png";
        hitboxEnemy.style.bottom = '';
        mario.src = "./imagens/personagem/mario.gif";
        mario.style.height = '';
        mario.style.top = '';
        mario.style.right = '';
        mario.style.width = '';
    }

    // Action when the game ends
    function GameOver(marioPosition) {
        fastFall = false;
        alive = false;
        clearInterval(loop); // Stops the loop that counts the points and checks if the character collided
        document.removeEventListener('keydown', KeyDownEvent);
        document.removeEventListener('keyup', KeyUpEvent);
        screen.classList.remove('efeitoPulo')
        hitboxMario.style.bottom = `${marioPosition}px`;
        mario.src = "./imagens/personagem/mario_morto.png";
        mario.style.height = '100px';
        mario.style.top = '7px';
        mario.style.right = '0px';
        mario.style.width = 'auto';
        screen.classList.add('menuAnimation');
        container.classList.add('menuAnimation2');
        container.style.display = 'flex';
        points.style.display = 'none';
        menu.classList.add('fadeIn');
        ranking.classList.add('fadeIn');

    }

    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * Starts the game loop.
     * The loop updates the positions of the enemy and clouds, checks for collisions with the player,
     * and handles game over conditions.
     */
    function StartLoop() {
        loop = setInterval(() => {
            let enemyPosition;
            let cloudsPosition;
            let cloudsPosition2;

            // Computes the height of the player
            var marioPosition = +window.getComputedStyle(hitboxMario).bottom.replace('px', '');

            // Increase speed based on points
            enemySpeed = 5 + (scoreCounter / 5);
            cloudSpeed = 1 + (scoreCounter / 7);

            // Generate random number
            randomNum = generateRandomNumber(1, 100);

            if (cloudPos < -800) {
                cloudPos = 800;
            }
            if (cloudPos2 < -800) {
                cloudPos2 = 800;
            }

            if (enemyPos < -99) { // Give 1 point when the enemy reaches the end of the screen
                enemyPos = 800;
                scoreCounter++;

                // Decrease duration by 0.1s for each point 
                points.innerHTML = scoreCounter.toString().padStart(4, '0');
                pointsMenu.innerHTML = scoreCounter.toString().padStart(4, '0');

                // Above 5 points, there is a 50% chance of the enemy being airborne
                if (randomNum < 50 && scoreCounter >= 5) {
                    enemy.src = './imagens/inimigo/boo.gif';
                    hitboxEnemy.style.bottom = '55px';
                    airborneEnemy = true;
                } else {
                    enemy.src = './imagens/inimigo/cano.png';
                    hitboxEnemy.style.bottom = '';
                    airborneEnemy = false;
                }
            } else if (enemySpeed < 14) { // If the enemy's speed is less than 14, the speed is based on points
                enemyPosition = enemyPos -= enemySpeed;
                hitboxEnemy.style.left = enemyPosition + 'px';
                cloudsPosition = cloudPos -= cloudSpeed;
                cloudsPosition2 = cloudPos2 -= cloudSpeed;
                clouds1.style.left = cloudsPosition + 'px';
                clouds2.style.left = cloudsPosition2 + 'px';
            } else { // If the speed is greater than 13, the speed will be locked at 1
                enemyPosition = enemyPos -= 13;
                hitboxEnemy.style.left = enemyPosition + 'px';
                cloudsPosition = cloudPos -= 7.2;
                cloudsPosition2 = cloudPos2 -= 7.2;
                clouds1.style.left = cloudsPosition + 'px';
                clouds2.style.left = cloudsPosition2 + 'px';
            }

            // Check if the player collided with the enemy
            if (enemyPosition > 0 && enemyPosition < 110 && marioPosition < 40 && airborneEnemy == false) {
                GameOver(marioPosition)
            } else if (enemyPosition > 0 && enemyPosition < 110 && airborneEnemy == true && big == true || enemyPosition > 0 && enemyPosition < 110 && marioPosition > 40 && airborneEnemy == true) {
                GameOver(marioPosition);
            }
        }, 10);
    }


    function jump(timestamp) {
        if (!jumpStart) jumpStart = timestamp;
        var progress = timestamp - jumpStart;
        var position = jumpDistance * Math.sin(progress / (fastFall ? jumpDuration * 0.75 : jumpDuration) * Math.PI);
        hitboxMario.style.bottom = `${position}px`;
        if (progress < (fastFall ? jumpDuration * 0.75 : jumpDuration) && alive == true) {
            window.requestAnimationFrame(jump);
        } else {
            if (alive == true) {
                hitboxMario.style.bottom = `0px`;
            }
            screen.classList.remove('efeitoPulo');
            jumpStart = null;  // Reset start time after animation finishes
            fastFall = false;  // Reset fast fall after animation finishes

        }
    }


    screen.addEventListener('click', function () {
        if (jumpStart === null && alive == true) {
            window.requestAnimationFrame(jump);
            screen.classList.add('efeitoPulo');
        }
    });

    
    screen.addEventListener('mousedown', function () {
        if (alive == true && big == true) {
            Shrink();
            if (jumpStart !== null) {
                fastFall = true;
            }
        }
    });

    screen.addEventListener('mouseup', function () {
        if (alive == true) {
            Enlarge();
            fastFall = false;
        }
    });

    var KeyDownEvent = function (event) {
        if ((event.key == ' ' || event.key == 'w' || event.key == 'ArrowUp' || event.key == "Enter") && jumpStart === null) {
            window.requestAnimationFrame(jump);
            screen.classList.add('efeitoPulo');
        }
        if (alive == true && big == true) {
            if (event.key == 'ArrowDown' || event.key == 's' || event.key == 'Shift') {
                Shrink();
                if (jumpStart !== null) {
                    fastFall = true;
                }
            }
        }
    };

    var KeyUpEvent = function (event) {
        if (event.key == 'ArrowDown' || event.key == 's' || event.key == 'Shift') {
            Enlarge();
            fastFall = false;
            if (jumpStart === null) {
                window.requestAnimationFrame(jump);
                screen.classList.add('efeitoPulo');
            }
        }
        if ((event.key == ' ' || event.key == 'w' || event.key == 'ArrowUp' || event.key == "Enter") && jumpStart === null && big == false) {
            window.requestAnimationFrame(jump);
            screen.classList.add('efeitoPulo');

        }
    };

    // Function for the character to grow
    function Enlarge() {
        if (big == false) {
            mario.src = './imagens/personagem/mario.gif';
            mario.style.height = '';
            mario.style.width = '';
            hitboxMario.style.height = '';
            mario.style.right = '';
            big = true;
        }
    }

    // Function for the character to shrink


    // Add an event listener for the click event on the button
    btnRestart.addEventListener('click', function () {
        init(); // Call the Reload() function when the button is clicked
    })

    var niancodeLogo = document.querySelector('.niancodeLogo');

    window.onload = function () {
        setTheme(0);
        document.getElementById("darkTheme").onclick = function () {
            setTheme(0);
            niancodeLogo.style.backgroundImage = 'url(./imagens/nian-code.png)';
        };
        document.getElementById("lightTheme").onclick = function () {
            setTheme(1);
            niancodeLogo.style.backgroundImage = 'url(./imagens/nian-codeblack.png)';
        }
        document.getElementById("marioTheme").onclick = function () {
            setTheme(2);
            niancodeLogo.style.backgroundImage = 'url(./imagens/nian-codeblack.png)';
        };
    };

    niancodeLogo.onclick = function () {
        window.open('https://nian-code.web.app/', '_blank');
    }

    /**
     * Sets the theme of the document body based on the given index.
     */
    function setTheme(index) {
        const body = document.body;
        switch (index) {
            case 0:
                body.className = 'dark';
                break;
            case 1:
                body.className = 'light';
                break;
            case 2:
                body.className = 'image';
                break;
            default:
                console.log('Índice inválido');
        }
    }

    // Start the game when the page loads
    init();
});
