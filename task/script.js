import { runTask } from './task.js';
import { taskDescription } from './task_description.js';
import { taskQuestionnaire } from './task_questionnaire.js';

// Initialize jsPsych
const jsPsych = initJsPsych();


function runAllTasks() {

  console.log("Starting description");
  taskDescription().then(() => {
    console.log("Description finished");
    console.log("Starting task...");
    runTask(jsPsych).then(() => {
      console.log(" task  completed.");
      console.log("quenstionnaire...");
      taskQuestionnaire().then(() => {
        console.log("quenstionnaire completed.");
      })
    })
  })


}

runAllTasks();
