const triviaDB = require('triviadb');
const base64 = require('base64-url');
var shuffleList = require('shuffle-list');

module.exports = {
    async getQuestions(num){
        var questions = (await triviaDB.getQuestions(num, null, "easy", "multiple", null, "base64")).results
                        .concat((await triviaDB.getQuestions(num, null, "medium", "multiple", null, "base64")).results)
                        .concat((await triviaDB.getQuestions(num, null, "hard", "multiple", null, "base64")).results)
        for (let index = 0; index < questions.length; index++) {
            var q = questions[index];
            
            for (let index = 0; index < q.incorrect_answers.length; index++) {
                q.incorrect_answers[index] = base64.decode(q.incorrect_answers[index]);
            }
        
            q = {
                question: base64.decode(q.question),
                correct_answer: base64.decode(q.correct_answer),
                incorrect_answers: q.incorrect_answers,
            }
            
            q["answers"] = shuffleList(q.incorrect_answers.concat([q.correct_answer]))
            questions[index] = q
        }
        return questions;
    },
    formatQuestionForAlexa(player, question){
        var answerString = ""
        for (let index = 0; index < question.answers.length; index++) {
            var answer = question.answers[index];
            answerString += `${index + 1}. ${answer}, `
        }
        return `Player ${player}: ${question.question} ${answerString}`
    },
    checkAnswer(question, answer){
        return question.answers[answer-1] === question.correct_answer;
    },
    getWinners(scores){
        let speak = "";
        var maxScore = Math.max(...scores);
        for (let index = 0; index < scores.length; index++) {
            if(scores[index] === maxScore) speak += `Player ${index+1} and `
        }
        speak = speak.substring(0, speak.length-4)
        if(speak.length > 10){
            speak = `The winners are ` + speak
        }else{
            speak = `The winner is ` + speak
        }        
        speak += `with ${maxScore} out of 3 questions correct. Congrats!`
        return speak
    }
}