export function taskQuestionnaire(jsPsych) { 
  return new Promise((resolve) => { 
    jsPsych = initJsPsych({ 
      experiment_width: 1000, 
      on_finish: function () { 
        // Get current date and time for file naming
        var date = new Date();
        var year = date.getFullYear();
        var month = ("0" + (date.getMonth() + 1)).slice(-2); // Add leading zero
        var day = ("0" + date.getDate()).slice(-2); // Add leading zero
        var hours = ("0" + date.getHours()).slice(-2); // Add leading zero
        var minutes = ("0" + date.getMinutes()).slice(-2); // Add leading zero
        var seconds = ("0" + date.getSeconds()).slice(-2); // Add leading zero
        var dateTime = `${day}_${month}_${year}_${hours}_${minutes}_${seconds}`;

        // Get the survey data
        var data = jsPsych.data.get().filter({trial_type: 'survey-likert'}).values()[0];

        // Map numeric responses to actual labels
        var responseLabels = [
          "Rarely/Never", 
          "Occasionally", 
          "Often", 
          "Almost Always/Always"
        ];

        // Create a new object with the mapped responses
        var answers = {};
        Object.keys(data.response).forEach(function(question, index) {
          answers[`Question_${index + 1}`] = responseLabels[data.response[question]];
        });

        // Convert the processed answers to CSV format with headers
        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "question,answer\n"; // Add headers

        Object.keys(answers).forEach(function(question) {
          csvContent += `${question},${answers[question]}\n`;
        });

        // Trigger CSV file download
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement('a');
        link.href = encodedUri;
        link.download = `questionnaire_responses_${dateTime}.csv`;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);

        // Show thank you message and then resolve
        document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
          <h1 style="font-size: 24px; text-align: center;">Thank you for your participation!</h1>
        </div>
      `;
      
        
        // After showing the thank you message for a while, resolve the promise
        setTimeout(() => {
          window.location = "https://www.neurosmiths.org/tasks.html";
          resolve(); 
        }, 3000); // 3-second delay before redirecting
      } 
    }); 

    var timeline = [];

    // Combining description with the questionnaire
    var questionnaire = {
      type: jsPsychSurveyLikert,
      preamble: `
        <div class="center">
          <div class="logo-title">
            <img src="img/logo.png" width="20%">
            <h1>Questionnaire</h1>
            <p>People differ in the ways they act and think in different situations. 
            This is a test to measure some of the ways in which you act and think. 
            Read each statement and choose your response. Do not spend too much time on any statement.</p>
          </div>
        </div>
      `,
      button_label: 'Done', // Replacing "Continue" with "Done"
      questions: [
        {prompt: "1. I plan tasks carefully.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "2. I do things without thinking.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "3. I make up my mind quickly.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "4. I am happy-go-lucky.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "5. I don't 'pay attention.'", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "6. I have 'racing' thoughts.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "7. I plan trips well ahead of time.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "8. I am self-controlled.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "9. I concentrate easily.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "10. I save regularly.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "11. I 'squirm' at plays or lectures.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "12. I am a careful thinker.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "13. I plan for job security.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "14. I say things without thinking.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "15. I like to think about complex problems.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "16. I change jobs.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "17. I act 'on impulse.'", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "18. I get easily bored when solving thought problems.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "19. I act on the spur of the moment.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "20. I am a steady thinker.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "21. I change residences.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "22. I buy things on impulse.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "23. I can only think about one thing at a time.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "24. I change hobbies.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "25. I spend or charge more than I earn.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "26. I often have extraneous thoughts when thinking.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "27. I am more interested in the present than the future.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "28. I am restless at the theater or lectures.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "29. I like puzzles.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true},
        {prompt: "30. I am future oriented.", labels: ["Rarely/Never", "Occasionally", "Often", "Almost Always/Always"], required: true}
      ]
    };

    timeline.push(questionnaire);

    // Start the experiment
    jsPsych.run(timeline);
  });
}
