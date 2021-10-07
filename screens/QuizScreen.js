// Script for the screen showing a quiz of five random questions.

// ------------ Imports ------------
import * as React from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { sharedStyles, dprint, WrappedAutoHeightImage } from '../components/SharedComponents.js';
import { Component } from 'react';

// ------------ App code start ------------

// The questions that can be used in the quiz. This is an array of objects,
// each with the following properties:
// item: A unique identifier for the question.
// title: The text of the question itself, used both on the question screen
//      and when showing the answers.
// answers: An array of objects for each answer for the question. There should
//      be at least one, and generally at least two answers. The objects should
//      have the following properties:
//      - id: A unique identifier for the answer.
//      - text: The text of the answer itself.
//      - correct: A boolean indicating whether the answer is the correct one
//          for the question. A question can have multiple correct answers.
// explanation: Text used on the results screen to explain why the correct
//      answer is correct.
// Optionally, a question can also have:
// image: An image (given through a require statement) that will be shown along
//      with the question.
// There should be at least five questions to randomly select from, unless the
// variable totalQuestions is modified to change the number.
const questionList =  [
    // Question with two possible answers and one correct one.
    {
        item: 'example_question_1',
        title: "This is an example quiz question.",
        answers: [
            {
                id: 0,
                text: "Questions can have any number of possible answers.",
                correct: false
            },
            {
                id: 1,
                text: "This is the correct answer to this question.",
                correct: true
            }
        ],
        explanation: "This example question had one correct answer."
    },
    // Question with three possbile answers and two correct ones.
    {
        item: 'example_question_2',
        title: "This is another example quiz question.",
        answers: [
            {
                id: 0,
                text: "More than one correct answer can be given for a question.",
                correct: false
            },
            {
                id: 1,
                text: "This is a correct answer to this question.",
                correct: true
            },
            {
                id: 2,
                text: "This is another correct answer to this question.",
                correct: true
            }
        ],
        explanation: "This example question had two correct answers."
    },
    // Question that has an image.
    {
        item: 'example_question_3',
        title: "This is yet another example quiz question.",
        image: require("../assets/images/exampleImage1.png"),
        answers: [
            {
                id: 0,
                text: "This is the correct answer to this question.",
                correct: true
            },
            {
                id: 1,
                text: "Quiz questions can have an image assigned to them, if you wish to spruce up the question or have the user answer something from a picture or diagram.",
                correct: false
            }
        ],
        explanation: "This example question had one correct answer and an image."
    },
    // Question with four possible answers and one correct one.
    {
        item: 'example_question_4',
        title: "This is the fourth example quiz question.",
        answers: [
            {
                id: 0,
                text: "It also has four possible answers, with this being the correct one.",
                correct: true
            },
            {
                id: 1,
                text: "Answer id 1 isn't correct.",
                correct: false
            },
            {
                id: 2,
                text: "Answer id 2 isn't correct.",
                correct: false
            },
            {
                id: 3,
                text: "Answer id 3 isn't correct.",
                correct: false
            }
        ],
        explanation: "This example question had one correct answer."
    },
    // Question with three possible answers and one correct one.
    {
        item: 'example_question_5',
        title: "This is the fifth example quiz question.",
        answers: [
            {
                id: 0,
                text: "Not correct",
                correct: false
            },
            {
                id: 1,
                text: "Correct",
                correct: true
            },
            {
                id: 2,
                text: "Not correct",
                correct: false
            }
        ],
        explanation: "This example question had one correct answer."
    },
    // Question with three possible answers that are all correct.
    {
        item: 'example_question_6',
        title: "The quiz automatically picks five random questions out of the whole set available.",
        answers: [
            {
                id: 0,
                text: "There should therefore be at least five questions to choose from. There will be an error if there are not enough.",
                correct: true
            },
            {
                id: 1,
                text: "However, the amount required, as well as whether random questions are selected, can be modified in the code.",
                correct: true
            },
            {
                id: 2,
                text: "Pick any answer as they are all correct.",
                correct: true
            }
        ],
        explanation: "All answers to this question were correct."
    },
];

// The total number of questions to use in the quiz.
const totalQuestions = 5;

// The component for rendering the quiz. It can show eitehr an introduction
// screen, quiz questions or a list of results.
class Quiz extends Component {

    // Set the state...
    state = {
        // An array of the question identifiers and the answers the user gave
        // (which begin as null and get changed to true or false later).
        userAnswers: generateQuizQuestions(),

        // Index of the current question.
        // If it is -1, the splash screen is shown.
        // If it is the same as the total number of questions, the score screen is
        // shown.
        currentQuestionIndex: -1,
    };

    // Possibilities for rendering the component.
    render() {

        // If we are at the end of the questions, show the results informing
        // them of how many they got right.
        if (this.state.currentQuestionIndex === totalQuestions) {
            // Determine how many were correct, and get an array of the
            // question explanations.
            var correctAnswers = 0;
            var explanations = [];
            for (var response of this.state.userAnswers) {

                // Get the question from the question list.
                var question = questionList.filter(obj => { return obj.item === response.item })[0];
                var userCorrect = false;
                var answerString = undefined;
                var userAnswerString = undefined;

                // Go through the answers in the question list to see if the
                // user gave the correct one.
                dprint("Checking if " + question.title + " was answered correctly...")
                dprint("User answered: " + response.userAnswer)
                for (var answer of question.answers) {
                    if (answer.correct && response.userAnswer === answer.id) {
                        userCorrect = true;
                    }
                    // Get the string for the correct answer(s).
                    if (answer.correct) {
                        if (answerString !== undefined) {
                            answerString += ", or " + answer.text;
                        } else {
                            answerString = answer.text;
                        }
                    }
                    // Get the string for the user's answer.
                    if (response.userAnswer === answer.id) {
                        userAnswerString = answer.text;
                    }
                }

                // Put the explanation of this question's answer in the list of
                // explanations to show, as well as whether the user got it
                // right.
                if (userCorrect) {
                    correctAnswers++;
                    explanations.push({
                        title: question.title,
                        explanation: question.explanation,
                        wasCorrect: true,
                        item: question.item,
                        answer: answerString,
                        userAnswer: userAnswerString,
                    });
                } else {
                    explanations.push({
                        title: question.title,
                        explanation: question.explanation,
                        wasCorrect: false,
                        item: question.item,
                        answer: answerString,
                        userAnswer: userAnswerString,
                    });
                }
            }

            // Return the elements for the screen.
            return (<View style={sharedStyles.infoContainer}>
            {/* The list of answers, whether the user got them correct or not,
            and the explanation for them. */}
            <View style={styles.scoreContainer}>
                <></>
                <Text style={styles.scoreHeader}>You got {correctAnswers} {correctAnswers == 1 ? "question" : "questions"} correct!</Text>
            </View>
            {explanations.map(explanation => (<View key={explanation.item} style={styles.explanationContainer}>
                <Text style={styles.explanationHeader}>{explanation.title}</Text>
                {explanation.wasCorrect ?
                    <Text style={styles.explanationHeaderCorrect}>You got this question correct</Text> :
                    <Text style={styles.explanationHeaderIncorrect}>You got this question incorrect</Text>}
                <Text style={styles.explanationText}>Correct answer: {explanation.answer}</Text>
                <Text style={styles.explanationText}>Your answer: {explanation.userAnswer}</Text>
                <Text style={styles.explanationText}>{explanation.explanation}</Text>
            </View>))}

            {/* A button to let the user try the quiz again. */}
            <TouchableHighlight
                onPress={(event) => {
                    this.setState(state => {
                        var newState = {
                            userAnswers: generateQuizQuestions(),
                            currentQuestionIndex: -1,
                        }
                        return newState;
                    });
                }}>
                <Text style={sharedStyles.roundButton}>Try again</Text>
            </TouchableHighlight>
            </View>)

        // Otherwise, if we are on a question, show the question element.
        } else if (this.state.currentQuestionIndex > -1 && this.state.currentQuestionIndex < totalQuestions) {

            // Get the question we are currently on.
            var userAnswer = this.state.userAnswers[this.state.currentQuestionIndex];
            var currentQuestion = questionList.filter(obj => { return obj.item === userAnswer.item })[0];

            // Return the elements for the screen.
            return (<View style={sharedStyles.infoContainer}>
                {/* The question text and the image associated with it. */}
                <View style={styles.questionContainer}>
                    <></>
                    <Text style={styles.questionHeader}>{currentQuestion.title}</Text>
                    {/* Only show an image if the question has one. */}
                    {currentQuestion.image &&
                    <WrappedAutoHeightImage
                        source={currentQuestion.image}
                        style={styles.questionImage}
                    />}
                </View>

                {/* The list of buttons for the possible answers. */}
                <View>
                    {currentQuestion.answers.map(answer => (
                        <TouchableHighlight key={answer.id}
                        onPress={(event) => {
                            // https://www.robinwieruch.de/react-state-array-add-update-remove/
                            // Update the user answers array to show the answer.
                            this.setState(state => {
                                var newState = {
                                    userAnswers: null,
                                    currentQuestionIndex: null,
                                }

                                // Create a new list which is a copy of the
                                // original but with the answer set on the
                                // corresponding item.
                                newState.userAnswers = this.state.userAnswers.map((item, j) => {

                                    // If this is the correct item, set the answer.
                                    if (j === this.state.currentQuestionIndex) {
                                        var newItem = item;
                                        newItem.userAnswer = answer.id;
                                        return newItem;

                                    // Otherwise just return the item.
                                    } else {
                                        return item;
                                    }
                                });

                                // Increment the current question index.
                                newState.currentQuestionIndex = this.state.currentQuestionIndex + 1;

                                // Return the new state.
                                return newState;
                            });
                        }}
                    >
                        <Text style={sharedStyles.roundButton}>{answer.text}</Text>
                    </TouchableHighlight>))}
                </View>
            </View>)

        // Otherwise display the starting screen.
        } else {
            return (<View style={sharedStyles.infoContainer}>
            <View style={styles.startContainer}>
                <Text style={sharedStyles.bannerText}>If you want to test your knowledge about composting, you can take a go at this quiz! There will be five questions selected at random.</Text>
            </View>
            {/* A button for proceeding to the rest of the quiz.*/}
            <TouchableHighlight
                onPress={(event) => {
                    this.setState(state => {
                        var newState = {
                            userAnswers: this.state.userAnswers,
                            currentQuestionIndex: this.state.currentQuestionIndex + 1,
                        }
                        return newState;
                    });
                }}
            >
                <Text style={sharedStyles.roundButton}>Start</Text>
            </TouchableHighlight>
            </View>)
        }
    }
}

// The main quiz screen component, containing the above Quiz component.
export default function QuizScreen( {navigation, route} ) {

    return (
    <View style={sharedStyles.standardContainer}>
            <ScrollView style={sharedStyles.standardContainer} contentContainerStyle={sharedStyles.infoContentContainer}>
                <Quiz/>
            </ScrollView>
    </View>
    )
}

// https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array/38571132
// Gets a random n elements from an array, used to select random quiz questions.
function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

// Creates an array of random quiz questions.
function generateQuizQuestions() {
    var randomQuestions = getRandom(questionList, totalQuestions);

    // Array for passing the questions to the special component
    var userAnswers = [];

    for (var question of randomQuestions) {
        userAnswers.push({ item: question.item, userAnswer: null });
    }
    return userAnswers;
}

// Styles used only in this script.
const styles = StyleSheet.create({
    questionContainer: {
      alignItems: "center",
      margin: 10,
    },

    questionImage: {
      marginTop: 10,
      width: "90%",
    },

    questionHeader: {
      fontSize: 20,
      fontWeight: "bold",
    },

    explanationContainer: {
        marginBottom: 5,
        marginTop: 10,
    },

    explanationHeaderCorrect: {
        fontSize: 20,
        fontWeight: "bold",
        color: "green",
    },

    explanationHeaderIncorrect: {
        fontSize: 20,
        fontWeight: "bold",
        color: "red",
    },

    scoreHeader: {
        fontSize: 20,
        fontWeight: "bold",
    },

    scoreContainer: {
      alignItems: "center",
    },

    startContainer: {
        margin: 10,
        alignItems: "center",
    },

    questionText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
    },

    explanationHeader: {
        fontSize: 20,
        fontWeight: "bold",
    },
    explanationText: {
      fontSize: 17,
      marginBottom: 2,
    },
  });