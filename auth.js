import app from './firebase-sdk.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    onAuthStateChanged, 
    signOut,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Ensure the auth component is registered properly
const auth = getAuth(app);

const mainView = document.getElementById("ui-section")

const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");


const email = document.getElementById("email");
const password = document.getElementById("password");
const signUpBtn = document.getElementById("signup-btn");
const UIErrorMessage = document.getElementById("error-message");

const signUpFormView = document.getElementById("signup-form");
const userProfileView = document.getElementById("user-profile");
const UIuserEmail = document.getElementById("user-email");
const logOutBtn = document.getElementById("logout-btn");



onAuthStateChanged(auth, (user) => {

    console.log(user);
    if (user) {
        UIuserEmail.innerHTML = user.email;

        loginForm.style.display = "none";
        userProfileView.style.display = "block";

    } else {

        loginForm.style.display = "block";
        userProfileView.style.display = "none";

    }
    mainView.classList.remove("loading");
});

const signUpBtnPressed = async (e) => {
    e.preventDefault();

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );
        console.log(userCredential);




    } catch (error)  {
        console.log(error);
        UIErrorMessage.innerHTML = formatErrorMessage(error.code);
        UIErrorMessage.classList.add('visible');
    }
    
};

const logOutBtnPressed = async() => {
    try {
        await signOut(auth);
        email.value = "";
        password.value = "";
    } catch (error){
        console.log(error);
    };
    
}


const loginBtnPressed = async (e) => {
    e.preventDefault();

    try {
        await signInWithEmailAndPassword(
            auth,
            loginEmail.value,
            loginPassword.value
        );
    } catch(error) {

    }

    
}


signUpBtn.addEventListener("click", signUpBtnPressed);
logOutBtn.addEventListener("click", logOutBtnPressed);
loginBtn.addEventListener("Click", loginBtnPressed);

const formatErrorMessage = (errorCode) => {
    let message = "";
    if (
        errorCode === "auth/invalid-email" || 
        errorCode === "auth/missing-email"
    ) {
        message = "Please enter a valid Email";
    } else if (
        errorCode === "auth/missing-password" ||
        errorCode === "auth/weak-password"
    ) {
        message = "Password must be at least 6 characters long";
    } else if (
        errorCode === "auth/email-already-in-use"
    ) {
        message = "Email is already taken";
    } else {
        message = "Unknown Error";
    }
    return message;
};
