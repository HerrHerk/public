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

const mainView = document.getElementById("ui-section");

const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginErrorMessage = document.getElementById("login-error-message");
const needAnAccountBtn= document.getElementById("need-an-account-btn");

const email = document.getElementById("email");
const password = document.getElementById("password");
const signUpBtn = document.getElementById("signup-btn");
const UIErrorMessage = document.getElementById("error-message");
const signUpFormView = document.getElementById("signup-form");
const haveAnAccountBtn = document.getElementById("have-an-account-btn");

const userProfileView = document.getElementById("user-profile");
const UIuserEmail = document.getElementById("user-email");
const logOutBtn = document.getElementById("logout-btn");

const signUpLogInBtn = document.getElementById("sign-up-log-in-btn");
const profileDataBtn = document.getElementById("profile-data-btn");
const profileLogOutBtn = document.getElementById("profile-logout-btn");
const authLinksLogIn = document.getElementById("auth-links-login");
const authLinksLogOut = document.getElementById("auth-links-logout");

onAuthStateChanged(auth, (user) => {

    console.log(user);
    if (user) {
        UIuserEmail.innerHTML = user.email;

        loginForm.style.display = "none";
        userProfileView.style.display = "none";
        mainView.style.display = "none";
        authLinksLogIn.style.display = "none";
        authLinksLogOut.style.display = "flex"; // Show logout options

    } else {

        loginForm.style.display = "none";
        userProfileView.style.display = "none";
        authLinksLogIn.style.display = "flex";  // Show login options
        authLinksLogOut.style.display = "none";

    }
    mainView.classList.remove("loading");
});




const hideMainView = (e) => {
    
    if (e instanceof Event) {
        console.log(e.target);
        console.log(e.currenTtarget);
    
        if (e.target === e.currentTarget) {
            mainView.style.display = "none";
            loginForm.style.display = "none";
            userProfileView.style.display = "none";
        }         
    } else {
        mainView.style.display = "none";
        loginForm.style.display = "none";
        userProfileView.style.display = "none";
    }

}

const profileDataBtnPressed = () => {
    mainView.style.display = "flex";
    loginForm.style.display = "none";
    signUpFormView.style.display = "none";
    userProfileView.style.display = "block";
}


const profileLogOutBtnPressed = () => {
    logOutBtnPressed();
    authLinksLogIn.style.display = "flex";
    authLinksLogOut.style.display = "none";
    mainView.style.display = "none";

}

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
        UIErrorMessage.innerHTML = formatErrorMessage(error.code, "signup");
        UIErrorMessage.classList.add('visible');
    }
    
};

const logOutBtnPressed = async() => {
    try {
        await signOut(auth);
        email.value = "";
        password.value = "";
        mainView.style.display = "none";
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
        console.log(error);
        loginErrorMessage.innerHTML = formatErrorMessage(error.code, "login");
        loginErrorMessage.classList.add('visible');
    }

    
}


const needAnAccountBtnPressed = () => {
    loginForm.style.display = "none";
    signUpFormView.style.display = "block";
}

const haveAnAccountBtnPressed = () => {
    loginForm.style.display = "block";
    signUpFormView.style.display = "none";
}

// Function to show the login form and hide the sign-up form
const signUpLogInBtnPressed = (e) => {
    e.preventDefault(); // Prevent the default anchor link behavior
    mainView.style.display = "flex";
    loginForm.style.display = "block";
    signUpFormView.style.display = "none";
    // authLinksLogIn.style.display = "none";
    // authLinksLogOut.style.display = "flex";

};



signUpBtn.addEventListener("click", signUpBtnPressed);
logOutBtn.addEventListener("click", logOutBtnPressed);
loginBtn.addEventListener("click", loginBtnPressed);
needAnAccountBtn.addEventListener("click", needAnAccountBtnPressed);
haveAnAccountBtn.addEventListener("click", haveAnAccountBtnPressed);
signUpLogInBtn.addEventListener("click", signUpLogInBtnPressed);
mainView.addEventListener("click", hideMainView);
profileDataBtn.addEventListener("click", profileDataBtnPressed);
profileLogOutBtn.addEventListener("click", profileLogOutBtnPressed);

const formatErrorMessage = (errorCode, action) => {
    let message = "";

    if(action === "signup") {
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
    } else if (action === "login") {
        if (
            errorCode === "auth/invalid-email" || 
            errorCode === "auth/missing-password"
        ) {
            message = "Email or Password is incorrect";
        } else if (
            errorCode === "auth/user-not-found" ||
            errorCode === "auth/invalid-credential"
        ) {
            message= "Our system was unable to verify your email or password";

        } else {
            message = "Unknown Error";
        }
    }


    return message;
};
