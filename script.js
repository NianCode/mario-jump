// The code was written by NianCode.
// pt-br: Código escrito por NianCode.
// Email: nicolash.contato@gmail.com

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
    
    // Game state variables
    let scoreCounter = 0; // Initial value of the score counter
    let loop; // Loop variable
    let randomNum = 0 // Number that defines the chance of the enemy being airborne or not
    let enemyPos = 800 // Initial position of the enemy
    let enemySpeed = 5 // Initial speed of the enemy
    let airborneEnemy = false // Value to check if the enemy is airborne or not
    let big = true // Value to check if the character is big or not

    // Object with character information for reset
    const originalCharacters = {
        marioBottom: +window.getComputedStyle(hitboxMario).bottom.replace('px', ''),
        marioAnimation: hitboxMario.style.animation
    };

    // Cloud animation
    const Clouds = () => {
        document.querySelector('.nuvens').classList.add('nuvensAnimation'); // Add cloud animation
        setTimeout(() => {
            document.querySelector('.nuvens2').classList.add('nuvensAnimation'); // Add cloud animation for the second cloud
        }, 10000);
    };

    // Game initialization when the page loads
    function init() {
        StartLoop();
        Clouds();
        document.addEventListener('keydown', JumpEvent); // Makes the character jump when pressing W and shrink when pressing S
        document.addEventListener('keyup', Grow); // Makes the character grow when releasing S
    }

    // Reset characters to their initial position
    function ResetCharacters() {
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
    function GameOver(marioPosition, enemyPosition) {
        clearInterval(loop); // Stops the loop that counts the points and checks if the character collided

        document.removeEventListener('keydown', JumpEvent);
        document.removeEventListener('keyup', Grow);

        hitboxMario.style.bottom = `${marioPosition}px`;
        hitboxMario.style.animation = "none";
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

    // Reload the game
    function Reload() {
        document.addEventListener('keydown', JumpEvent);
        document.addEventListener('keyup', Grow);

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

        init();
    }

    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Start the game loop
    function StartLoop() {
        loop = setInterval(() => {
            let enemyPosition;

            // Computes the height of the player
            var marioPosition = +window.getComputedStyle(hitboxMario).bottom.replace('px', '');
            var marioHeight = +window.getComputedStyle(hitboxMario).height.replace('px', '');

            // Increase speed based on points
            enemySpeed = 5 + (scoreCounter / 5);

            // Generate random number
            randomNum = generateRandomNumber(1, 100);

            if (enemyPos < -99) { // Give 1 point when the enemy reaches the end of the screen

                enemyPos = 800;
                scoreCounter++;

                points.innerHTML = scoreCounter.toString().padStart(4, '0');
                pointsMenu.innerHTML = scoreCounter.toString().padStart(4, '0');

                // Above 5 points, there is a 50% chance of the enemy being airborne
                if (randomNum < 50 && scoreCounter >= 5) {
                    enemy.src = './imagens/inimigo/boo.gif';
                    hitboxEnemy.style.bottom = '55px';
                    airborneEnemy = true;
                    console.log('it is an airborne enemy');
                } else {
                    enemy.src = './imagens/inimigo/cano.png';
                    hitboxEnemy.style.bottom = '';
                    airborneEnemy = false;
                    console.log('it is not an airborne enemy');
                }

            } else if (enemySpeed < 20) { // If the enemy's speed is less than 20, the speed is based on points

                enemyPosition = enemyPos -= enemySpeed;
                hitboxEnemy.style.left = enemyPosition + 'px';

            } else { // If the speed is greater than 20, the speed will be locked at 20

                enemyPosition = enemyPos -= 20;
                hitboxEnemy.style.left = enemyPosition + 'px';

            }

            // Check if the player collided with the enemy
            if (enemyPosition > 0 && enemyPosition < 110 && marioPosition < 40 && airborneEnemy == false || enemyPosition > 0 && enemyPosition < 110 && airborneEnemy == true && marioHeight > 55) {

                GameOver(marioPosition, enemyPosition);

                if (!screen.classList.contains('efeitoPulo')) {
                    screen.classList.add('menuAnimation');
                    container.classList.add('menuAnimation2');
                    container.style.display = 'flex';
                    points.style.display = 'none';
                } else {
                    screen.classList.remove('efeitoPulo');
                }

            }

        }, 10);
    }

    // Character jump animation
    const jump = () => {
        if (hitboxMario.classList.contains('pulo') || screen.classList.contains('menuAnimation')) {
            return 0;
        } else {
            hitboxMario.classList.add('pulo');
            screen.classList.add('efeitoPulo');
            hitboxMario.style.height = '120px';
            setTimeout(() => {
                if (big == false) {
                    hitboxMario.style.height = '50px';
                }
                hitboxMario.classList.remove('pulo');
                screen.classList.remove('efeitoPulo');
            }, 500);
        }
    }

    // Event to jump with W, also makes the character shrink with S
    const JumpEvent = function (event) {
        if (event.key == ' ' || event.key == 'w' || event.key == 'ArrowUp' || event.key == "Enter") {
            jump();
        }
        if (screen.classList.contains('menuAnimation')) {
            return 0;
        } else {
            if (big == true) {
                if (event.key == 'ArrowDown' || event.key == 's' || event.key == 'Shift') {
                    Shrink();
                }
            }
        }
    }

    // Event for the character to grow
    const Grow = function (event) {
        if (event.key == 'ArrowDown' || event.key == 's' || event.key == 'Shift') {
            Enlarge();
        }
    }

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
        Reload(); // Call the Reload() function when the button is clicked
    })

    // Start the game when the page loads
    init();
});
