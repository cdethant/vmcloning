export function runTask(jsPsych) {
  // Initialize jsPsych here if it's not initialized elsewhere
  return new Promise((resolve) => {
    jsPsych = initJsPsych({
      experiment_width: 1000,
      on_finish: function () {
        resolve()
      }
    });

    var totalReward = 0;
    const popSound = new Audio('sound/pop.wav');
    const bankSound = new Audio('sound/bank.wav');
    let trialData = [];
    let TrialNum = 5;
    let BalloonSizeStep = 7;
    let specialTrialCount = Math.round(TrialNum * 0.25); // 25% special trials (gray + special colorful)
    let normalTrialCount = TrialNum - specialTrialCount;  // 75% normal trials
    let timeline = [];

    var colorMeans = {
      red: 180,
      orange: 280,
      yellow: 380,
      gray: 270
    };
    var colorStds = {
      red: 40,
      orange: 40,
      yellow: 40,
      gray: 0
    };

    function getGaussianRandom(mean, stdDev) {
      let u = Math.random(), v = Math.random();
      return mean + stdDev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    // Create normal, special, and gray trials
    let trials = [];

    // Create normal (non-special) balloon trials
    for (let i = 0; i < normalTrialCount; i++) {
      let otherBalloonColors = ["red", "orange", "yellow"];
      let balloonColor = otherBalloonColors[Math.floor(Math.random() * otherBalloonColors.length)];

      let maxBalloonSize = getGaussianRandom(colorMeans[balloonColor], colorStds[balloonColor]);
      maxBalloonSize = Math.max(BalloonSizeStep, Math.round(maxBalloonSize));

      trials.push({
        balloonColor: balloonColor,
        isSpecial: false,
        maxBalloonSize: maxBalloonSize
      });
    }

    // Create special colorful balloon and gray balloon trials
    for (let i = 0; i < specialTrialCount; i++) {
      let balloonColor;
      let isSpecial = false;

      if (Math.random() < 0.5) {
        // 50% chance for gray
        balloonColor = "gray";
      } else {
        let otherBalloonColors = ["red", "orange", "yellow"];
        balloonColor = otherBalloonColors[Math.floor(Math.random() * otherBalloonColors.length)];
        isSpecial = true;
      }

      let maxBalloonSize = getGaussianRandom(colorMeans[balloonColor], colorStds[balloonColor]);
      maxBalloonSize = Math.max(BalloonSizeStep, Math.round(maxBalloonSize));

      trials.push({
        balloonColor: balloonColor,
        isSpecial: isSpecial,
        maxBalloonSize: maxBalloonSize
      });
    }

    // Shuffle the trials to randomize the order
    trials = jsPsych.randomization.shuffle(trials);

    // Create timeline based on shuffled trials
    trials.forEach(trial => {
      let { balloonColor, isSpecial, maxBalloonSize } = trial;

      timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: function () {
          const fixedCircleSize = Math.round(maxBalloonSize);
          return `
            <div class="trial-container">
              <div id="black-square" class="black-square"></div>
              <h2 class="total-reward">total reward: $ ${totalReward.toFixed(1)}</h2>
              <div class="balloon-container">
                <div class="circle-container">
                  ${(isSpecial || balloonColor === "gray") ? `<div class="fixed-circle" style="width: ${fixedCircleSize}px; height: ${fixedCircleSize}px;"></div>` : ''}
                  <div id="balloon" class="balloon" style="background-color: ${balloonColor}; border-radius: 50%; width: 50px; height: 50px;">
                    <div id="reward" class="reward">0</div>
                  </div>
                </div>
              </div>
              <div class="button-container">
                ${(!isSpecial && balloonColor !== "gray") ? '<button id="bank" class="bank-button" style="display: none;">bank(space)</button>' : ''}
                <button id="inflate" class="inflate-button">inflate(space)</button>
              </div>
            </div>
          `;
        },
        choices: [],
        on_load: function () {
          let balloon = document.getElementById('balloon');
          let rewardElement = document.getElementById('reward');
          let inflateButton = document.getElementById('inflate');
          let bankButton = document.getElementById('bank');
          let totalRewardElement = document.querySelector('.total-reward');
          let blackSquare = document.getElementById('black-square');
          let balloonSize = 50;
          let reward = 0.0;
          let inflationInterval;

          const isGrayBalloon = balloonColor === "gray";
          const isSpecialBalloon = isSpecial;

          let balloonTime, inflateTime, outcomeTime, reactionTime, inflationTime;

          balloonTime = performance.now();

          blackSquare.style.display = 'block';
          setTimeout(() => {
            blackSquare.style.display = 'none';
          }, 100);
          function inflateBalloon() {
            inflateButton.style.display = 'none';
            inflateTime = performance.now();
          
            // Show the black square for 100 ms when the inflation button is pressed
            blackSquare.style.display = 'block';
            setTimeout(() => {
              blackSquare.style.display = 'none';
            }, 100);
          
            if (!isGrayBalloon && !isSpecialBalloon) {
              bankButton.style.display = 'block';
            }
          
            inflationInterval = setInterval(function () {
              if (balloonSize < maxBalloonSize) {
                balloonSize += BalloonSizeStep;
                if (!isGrayBalloon || isSpecialBalloon) {
                  reward += 0.10;
                }
                balloon.style.width = `${balloonSize}px`;
                balloon.style.height = `${balloonSize}px`;
                rewardElement.textContent = reward.toFixed(1);
              } else {
                clearInterval(inflationInterval);
                balloon.style.display = 'none';
          
                // Play pop sound only for non-gray, non-special balloons that pop
                if (!isGrayBalloon && !isSpecialBalloon) {
                  popSound.play();
                }
          
                const fixedCircle = document.querySelector('.fixed-circle');
                if (fixedCircle) {
                  fixedCircle.style.display = 'none';
                }
                if (bankButton) bankButton.style.display = 'none';
          
                outcomeTime = performance.now();
                let outcome = 'popped';
          
                // Show the black square for 100 ms when the outcome is shown
                blackSquare.style.display = 'block';
                setTimeout(() => {
                  blackSquare.style.display = 'none';
                }, 100);
          
                if (isSpecialBalloon) {
                  totalReward += reward;
                  totalRewardElement.textContent = `total reward: $ ${totalReward.toFixed(1)}`;
                  outcome = 'banked';
          
                  // Play bank sound for special trials
                  if (!isGrayBalloon) {
                    bankSound.play();
                  }
          
                  let trialContainer = document.querySelector('.trial-container');
                  let popMessage = document.createElement('div');
                  popMessage.innerHTML = 'banked!';
                  popMessage.style.fontSize = '50px';
                  popMessage.style.color = 'green';
                  popMessage.style.fontWeight = 'bold';
                  trialContainer.appendChild(popMessage);
                  setTimeout(jsPsych.finishTrial, 1000);
                } else if (!isGrayBalloon) {
                  totalReward += 0;
                  totalRewardElement.textContent = `total reward: $ ${totalReward.toFixed(1)}`;
          
                  let trialContainer = document.querySelector('.trial-container');
                  let popMessage = document.createElement('div');
                  popMessage.innerHTML = 'popped!';
                  popMessage.style.fontSize = '50px';
                  popMessage.style.color = 'red';
                  popMessage.style.fontWeight = 'bold';
                  trialContainer.appendChild(popMessage);
                  setTimeout(jsPsych.finishTrial, 1000);
                } else {
                  // For gray balloons, no sound is played
                  setTimeout(jsPsych.finishTrial, 1000);
                }
          
                reactionTime = inflateTime - balloonTime;
                inflationTime = outcomeTime - inflateTime;
          
                trialData.push({
                  balloonType: balloonColor + (isSpecial ? " (special)" : ""),
                  outcome: outcome,
                  reactionTime: reactionTime,
                  inflationTime: inflationTime,
                  reward: totalReward
                });
              }
            }, 100);
          }
          
          function bankReward() {
            clearInterval(inflationInterval);
          
            outcomeTime = performance.now();
          
            // Play bank sound for normal and special balloons, but not gray balloons
            if (!isGrayBalloon) {
              bankSound.play();
            }
          
            // Show the black square for 100 ms when the reward is banked
            blackSquare.style.display = 'block';
            setTimeout(() => {
              blackSquare.style.display = 'none';
            }, 100);
          
            totalReward += reward;
            totalRewardElement.textContent = `total reward: $ ${totalReward.toFixed(1)}`;
            reward = 0;
            rewardElement.textContent = reward;
            balloon.style.display = 'none';
            inflateButton.style.display = 'none';
            if (bankButton) bankButton.style.display = 'none';
          
            let trialContainer = document.querySelector('.trial-container');
            let bankMessage = document.createElement('div');
            bankMessage.innerHTML = 'banked!';
            bankMessage.style.fontSize = '50px';
            bankMessage.style.color = 'green';
            bankMessage.style.fontWeight = 'bold';
            trialContainer.appendChild(bankMessage);
            setTimeout(jsPsych.finishTrial, 1000);
          
            reactionTime = inflateTime - balloonTime;
            inflationTime = outcomeTime - inflateTime;
          
            trialData.push({
              balloonType: balloonColor + (isSpecial ? " (special)" : ""),
              outcome: 'banked',
              reactionTime: reactionTime,
              inflationTime: inflationTime,
              reward: totalReward
            });
          }
          
                    
          

          inflateButton.addEventListener('click', inflateBalloon);
          if (bankButton) {
            bankButton.addEventListener('click', bankReward);
          }

          document.addEventListener('keydown', function (event) {
            if (event.code === 'Space') {
              if (inflateButton.style.display !== 'none') {
                inflateBalloon();
              } else if (bankButton && bankButton.style.display !== 'none') {
                bankReward();
              }
            }
          });
        }
      });

      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: 'NO_KEYS', // No keypress allowed during ITI
        trial_duration: 750, // Set ITI duration to 750 ms
      });
    });

    // Function to save trial data to CSV
    function saveCSV() {
      var date = new Date();
      var year = date.getFullYear();
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var day = ("0" + date.getDate()).slice(-2);
      var hours = ("0" + date.getHours()).slice(-2);
      var minutes = ("0" + date.getMinutes()).slice(-2);
      var seconds = ("0" + date.getSeconds()).slice(-2);

      var dateTime = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;

      const header = "balloonType,outcome,reactionTime(ms),inflationTime(ms),total reward\n";
      const rows = trialData.map(trial => `${trial.balloonType},${trial.outcome},${trial.reactionTime},${trial.inflationTime},${trial.reward}\n`);
      const csvContent = header + rows.join('');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      const fileName = `task_data_${dateTime}.csv`;
      a.setAttribute('href', url);
      a.setAttribute('download', fileName);
      a.click();
    }

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="font-size: 24px; text-align: center;">
          <h3>Press 'C' to continue to the questionnaire.</h3>
        </div>`,
      choices: ['c'],
      on_finish: function () {
        saveCSV();
      }
    });

    // Initialize the experiment
    jsPsych.run(timeline);
  });
}
