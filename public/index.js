const userUrl = 'http://localhost:3000/users'
let signUpBtn = document.getElementById('sign-up-btn')
let signInBtn = document.getElementById('sign-in-btn')
var state;


signUpBtn.addEventListener('click', signUp)
signInBtn.addEventListener('click', signIn)



//@desc: Check if already Logged In
function checkAuthState() {
  state = JSON.parse(sessionStorage.getItem('auth'))
  if (state == null || state == undefined || state == '') {
    return
  } else if (state.token) {
    location.replace('./chat/chatHome.html')
  } else {
    return
  }
}
checkAuthState();



//@desc: Sign up logic
async function signUp(e) {
  e.preventDefault();
  const nameInp = document.getElementById("name-up").value;
  const emailInp = document.getElementById("email-up").value;
  const phoneInp = document.getElementById("phone-up").value;
  const passInp = document.getElementById("password-up").value;
  try {
    if (nameInp.length < 3 || nameInp === "") {
      throw new Error("Enter a valid Name!");
    } else if (emailInp.indexOf("@") === -1) {
      throw new Error("Enter a valid Email ID!");
    } else if (phoneInp.length < 10 || isNaN(phoneInp)) {
      throw new Error("Enter a valid Phone No!");
    } else if (passInp.length < 5) {
      throw new Error("Enter a Strong Password!");
    }
    const obj = {
      name: nameInp,
      email: emailInp,
      phone: phoneInp,
      password: passInp,
    }
    const response = await axios.post(`${userUrl}/signup`, obj)
    if (!response || response === undefined) {
      throw new Error(response.data.message);
    } else {
      document.getElementById("name-up").value = "";
      document.getElementById("email-up").value = "";
      document.getElementById("phone-up").value = "";
      document.getElementById("password-up").value = "";
      //console.log(response.data.message)
      alert("Sign Up Successful!");
      return;
    }
  } catch (error) {
    alert(error.response.data.message);
  }
}



//@desc: sign in logic
async function signIn(e) {
  e.preventDefault();
  const emailInput = document.getElementById("email-in").value;
  const passInput = document.getElementById("password-in").value;
  try {
    if (emailInput.indexOf("@") === -1) throw new Error("Enter a valid Email ID!");
    if (passInput.length < 5) throw new Error("Enter a valid Password(more than 5 characters)!");
    document.getElementById("email-in").value = "";
    document.getElementById("password-in").value = "";

    let credential = { email: emailInput, password: passInput };
    const response = await axios.post(`${userUrl}/signin`, credential)
    if (response.status === 200 && response.data.token !== '' && response.data.token !== undefined) {
      alert(response.data.message);
      sessionStorage.setItem("auth",
        JSON.stringify({
          token: response.data.token,
          userId: response.data.userId,
        })
      );
      checkAuthState();
      return;
    }
    else {
      throw new Error("Error in credentials");
    }
  }
  catch (err) {
    alert(err.response.data.message)
    return;
  }
}




