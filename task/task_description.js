
export function taskDescription() { 
  return new Promise((resolve) => { 
    jsPsych = initJsPsych({ 
      experiment_width: 1000, 
      on_finish: function () { 
        resolve() 
      } 
    }); 

var timeline = [];

// Title Screen
var title_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="center">
      <div class="logo-title">
        <img src="img/logo.png" width="20%">
        <h1>Balloon Analog Risk Task (BART)</h1>
      </div>
    </div>
  `,
  choices: ['Start']
};
timeline.push(title_screen);

// Confirmation Screen
var confs = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "This study works properly only on PCs and laptops, and not on smartphones or tablets. Please confirm that you take part via Desktop PC or Laptop.",
      name: 'DesktopConf',
      options: ['I confirm'],
      required: true
    }
  ],
  preamble: `
    <p><img src="img/logo.png" width="20%"></p>
    <p><b>Welcome to this experiment and thank you very much for your participation.</b></p>
  `,
};
timeline.push(confs);

// Consent Form
var consent_form = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Do you agree with the terms above?",
      name: 'Consent',
      options: ['I agree.'],
      required: true
    }
  ],
  preamble: `
<p><img src="img/logo.png" width="20%"></p>
<h1 style="text-align: left;">Consent to participate in research</h1>
<h2 style="text-align: left;">Purpose:</h2>
<p>You are invited to participate in a research study aimed at understanding decision-making behavior. This study involves completing a brief online task.</p>

<h2 style="text-align: left;">Duration:</h2>
<p>Your participation will take approximately 30 minutes.</p>

<h2 style="text-align: left;">Procedures:</h2>
<p>You will complete an online task, which may involve decision-making exercises. In the next steps the task will be explained.</p>

<h2 style="text-align: left;">Risks and Benefits:</h2>
<p>There are no known risks beyond typical discomfort from screen usage. There are no direct benefits to you, but your participation will contribute to research on behavior.</p>

<h2 style="text-align: left;">Confidentiality:</h2>
<p>Your responses will be kept confidential and anonymous. No identifying information will be linked to your data.</p>

<h2 style="text-align: left;">Voluntary Participation:</h2>
<p>Your participation is voluntary, and you may withdraw at any time without penalty.</p>

<h2 style="text-align: left;">Contact Information:</h2>
<p>If you have any questions, please contact NeuroSmith lab.</p>
`
};
timeline.push(consent_form);


/// Demographic Form with multiple questions
var demographic_form = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "What is your gender?",
      name: 'gender',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      required: true
    },
    {
      prompt: "What is your age range?",
      name: 'age',
      options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
      required: true
    },
    {
      prompt: "What is your ethnicity?",
      name: 'ethnicity',
      options: ['Hispanic or Latino', 'Not Hispanic or Latino', 'Prefer not to say'],
      required: true
    },
    {
      prompt: "What is your race?",
      name: 'race',
      options: ['American Indian or Alaska Native', 'Asian', 'Black or African American', 'Native Hawaiian or Other Pacific Islander', 'White', 'Prefer not to say'],
      required: true
    }
  ],
  preamble: `
<p><img src="img/logo.png" width="20%"></p>
  <p><b>Demographic form.</b></p>
`,
  data: { task: 'demographic' } // Add a data tag to identify this form
};

timeline.push(demographic_form);

// Task Description
var task_description = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="center">
      <h2>Task description</h2>
      <img src="img/task.png" width="50%">
      <p>The task begins with the initial screen showing a small balloon (yellow/orange/red/grey).</p>
      <p><b>Inflate Start:</b> The balloon starts to inflate once you press inflate button.</p>
      <p><b>Inflation Phase:</b> During the inflation phase, the balloon grows larger, and you decide when to stop inflating it.</p>
      <p><b>Trial End:</b> The trial ends when you either stop inflating the balloon or the balloon pops.</p>
      <p><b>Outcome:</b></p>
      <ul><li>If you stop inflating the balloon before it pops, you <b>bank</b> the money accumulated and the trial ends successfully.</li>
        <li>If the balloon size exceeds a certain maximum threshold, the balloon <b>pops</b>, and you lose the money for that trial.</li>
      </ul>
      <p><b>Note:</b></p>
      <p>The gray balloons are passive trials and the balloons with gray circles around them are learning trials. In both cases, you only need to start the inflation.</p>
      <p>At the end of the task, there will be a questionnaire. We kindly ask you to take a 5 minutes to answer the questions.</p>
    </div>
  `,
  choices: ['Next'],
  on_finish: function(data) {
    downloadDemographicData(); // Automatically download the data
  }
};
timeline.push(task_description);
jsPsych.run(timeline); 


//////////////////////////////////////////FUNCTIONS/////////////////////////////////////////////////////////
// Function to automatically download demographic data
function downloadDemographicData() {
  // Filter the demographic form responses only using the 'task' data tag
  var demographic_data = jsPsych.data.get().filter({task: 'demographic'}).values();

  // Convert to CSV format
  var csv = 'Gender, Age, Ethnicity, Race\n';
  demographic_data.forEach(function(row) {
    csv += `${row.response.gender}, ${row.response.age}, ${row.response.ethnicity}, ${row.response.race}\n`;
  });

  // Get current date and time for file naming
  var date = new Date();
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero
  var day = ("0" + date.getDate()).slice(-2); // Add leading zero
  var hours = ("0" + date.getHours()).slice(-2); // Add leading zero
  var minutes = ("0" + date.getMinutes()).slice(-2); // Add leading zero
  var seconds = ("0" + date.getSeconds()).slice(-2); // Add leading zero

  var dateTime = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;

  // Create a blob for CSV data
  var blob = new Blob([csv], { type: 'text/csv' });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  
  // Set the download attribute to the filename in 'date_time' format
  a.download = `demographic_data_${dateTime}.csv`;

  // Append anchor to body and trigger download
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

//////////////////////////////////////////FUNCTIONS/////////////////////////////////////////////////////////


}) 
}