// If using modules
//this task is used if we want to have real balloon images instead 
// of circles. 

var timeline;
if (typeof require !== 'undefined') {
  timeline = require('./task_description.js');
}

var jsPsych = initJsPsych({
  experiment_width: 1000,
  on_finish: function() {
    // we will get back to this link after when we're done.
    window.location = "http://localhost:8080/task/demo.html";
  },
  override_safe_mode: true
});

var balloonColors = ["red", "orange", "yellow"];
var colorMeans = {
  red: 200,
  orange: 300,
  yellow: 400
};
var colorStds = {
  red: 100,
  orange: 100,
  yellow: 100
};

function getGaussianRandom(mean, stdDev) {
  let u = Math.random(), v = Math.random();
  return mean + stdDev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

var totalReward = 0; // Total collected reward

for (let i = 0; i < 10; i++) {
  let balloonColor = balloonColors[Math.floor(Math.random() * balloonColors.length)];
  let maxBalloonSize = getGaussianRandom(colorMeans[balloonColor], colorStds[balloonColor]);
  maxBalloonSize = Math.max(10, Math.round(maxBalloonSize));

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
      return `
        <div class="trial-container">
          <h2 class="trial-number">Trial ${i + 1}</h2>
          <h2 class="total-reward">total reward: $ ${totalReward}</h2>
          <div class="balloon-container">
            <div id="balloon" class="balloon" style="background-image: url('img/${balloonColor}.png');">
              <div id="reward" class="reward">0</div>
            </div>
          </div>
          <div class="button-container">
            <button id="inflate" class="inflate-button">inflate</button>
            <button id="bank" class="bank-button" style="display: none;">bank</button>
          </div>
        </div>
      `;
    },
    choices: [],
    on_load: function() {
      let balloon = document.getElementById('balloon');
      let rewardElement = document.getElementById('reward');
      let inflateButton = document.getElementById('inflate');
      let bankButton = document.getElementById('bank');
      let totalRewardElement = document.querySelector('.total-reward');
      let balloonSize = 50;
      let reward = 0;
      let inflationInterval;

      inflateButton.addEventListener('click', function() {
        inflateButton.style.display = 'none'; // Hide the inflate button
        bankButton.style.display = 'block'; // Show the bank button

        inflationInterval = setInterval(function() {
          if (balloonSize < maxBalloonSize) {
            balloonSize += 20;
            reward += 1; // Increment the reward by 1 with each inflate
            balloon.style.width = `${balloonSize}px`;
            balloon.style.height = `${balloonSize}px`;
            rewardElement.textContent = reward; // Update the reward display
          } else {
            clearInterval(inflationInterval); // Stop the inflation
            balloon.style.display = 'none';
            inflateButton.style.display = 'none';
            bankButton.style.display = 'none';
            let trialContainer = document.querySelector('.trial-container');
            let popMessage = document.createElement('div');
            popMessage.innerHTML = 'popped!';
            popMessage.style.fontSize = '50px';
            popMessage.style.color = 'red';
            popMessage.style.fontWeight = 'bold';
            trialContainer.appendChild(popMessage);
            setTimeout(jsPsych.finishTrial, 1000);
          }
        }, 100); // Inflate every 100 ms
      });

      bankButton.addEventListener('click', function() {
        clearInterval(inflationInterval); // Stop the inflation
        totalReward += reward; // Add the current reward to the total reward
        totalRewardElement.textContent = `total reward: $ ${totalReward}`; // Update the total reward display
        reward = 0; // Reset the current reward
        rewardElement.textContent = reward; // Update the reward display
        balloon.style.display = 'none'; // Hide the balloon
        inflateButton.style.display = 'none'; // Hide the inflate button
        bankButton.style.display = 'none'; // Hide the bank button
        let trialContainer = document.querySelector('.trial-container');
        let bankMessage = document.createElement('div');
        bankMessage.innerHTML = 'banked!';
        bankMessage.style.fontSize = '50px';
        bankMessage.style.color = 'green';
        bankMessage.style.fontWeight = 'bold';
        trialContainer.appendChild(bankMessage);
        setTimeout(jsPsych.finishTrial, 1000);
      });
    }
  });
}

jsPsych.run(timeline);
