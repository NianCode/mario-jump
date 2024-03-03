// The code was written by NianCode.
// pt-br: Código escrito por NianCode.
// Email: nicolash.contato@gmail.com

import db from './firebase.js';
import { collection, query, orderBy, limit, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', function () {


    document.getElementById('saveButton').onclick = function() {
        // Leia o nome do jogador do campo de entrada
        let playerName = document.getElementById('playerName').value;
    
        // Escreva o nome do jogador e a pontuação no Firestore
        addDoc(collection(db, "scores"), {
            name: playerName,
            score: score
        }).then(() => {
            console.log("Score saved!");
        }).catch((error) => {
            console.error("Error saving score: ", error);
        });
    };

    const scoresQuery = query(collection(db, "scores"), orderBy("score", "desc"), limit(5));

    getDocs(scoresQuery).then((querySnapshot) => {
        let rank = 1;
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            document.getElementById(`lblN${rank}Ranking`).textContent = data.name;
            document.getElementById(`n${rank}Ranking`).textContent = data.score;
            rank++;
        });
    });

































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
    let scoreCounter = 0; // Initial value of the score counter
    let loop; // Loop variable
    let randomNum = 0 // Number that defines the chance of the enemy being airborne or not
    let enemyPos = 800 // Initial position of the enemy
    let cloudPos = 800; // Initial position of the first cloud
    let cloudPos2 = 1600; // Initial position of the second cloud
    let cloudSpeed = 1; // Initial speed of the clouds
    let enemySpeed = 5 // Initial speed of the enemy
    let airborneEnemy = false // Value to check if the enemy is airborne or not
    let big = true // Value to check if the character is big or not
    let alive = true; // Value to check if the character is alive or not
    let jumpStart = null // Value to check if the character is jumping or not
    let jumpDistance = 120   // Jump distance
    let jumpDuration = 500 // Jump duration
    let jumpKeyIsDown = false // Value to check if the jump key is down or not

    // Object with character information for reset
    const originalCharacters = {
        marioBottom: +window.getComputedStyle(hitboxMario).bottom.replace('px', ''),
        marioAnimation: hitboxMario.style.animation
    };

    // Game initialization when the page loads
    function init() {
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

    var fastFall = false;
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

    KeyDownEvent = function (event) {
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

    KeyUpEvent = function (event) {
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

    // Add an event listener for the click event on the button
    btnRestart.addEventListener('click', function () {
        init(); // Call the Reload() function when the button is clicked
    })

    window.onload = function () {
        setTheme(0);
        document.getElementById("darkTheme").onclick = function () {
            setTheme(0);
        };
        document.getElementById("lightTheme").onclick = function () {
            setTheme(1);
        };
        document.getElementById("marioTheme").onclick = function () {
            setTheme(2);
        };
    };

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
