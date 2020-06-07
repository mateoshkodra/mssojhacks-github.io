// Variables/Constants
console.log('connected to game-layout')
// button 2
const buttondiv = document.getElementById('buttondiv');
var button1 = document.getElementById('button1');
var button2 = document.getElementById('button2');

//modals for forms
var modal1 = document.getElementById('modal1');

//spans
var span1 = document.getElementsByClassName("close")[0];

//Form #1 - create a lobby
const form1div = document.getElementById('creating-lobby');
const form1 = document.getElementById('form-container');

//header
const header1 = document.getElementById('headerform1');

//text
const lobbynamelabel1 = document.getElementById('lobby-name-label');
const lobbyname1 = document.getElementById('lobby-name');

//password
const lobbypasswordlabel1 = document.getElementById('lobby-password-label');
const password1 = document.getElementById('lobby-password');

//nickname
const nicknamelabel1 = document.getElementById('label-for-nickname');
const nickname1 = document.getElementById('name');

//Form#2 - join a lobby
const form2div = document.getElementById('joining-lobby');
const form2 = document.getElementById('join-lobby');

//header
const header2 = document.getElementById('headerforform2');

//text
const lobbynamelabel2 = document.getElementById('lobby-name-label-2');
const lobbyname2 = document.getElementById('lobby-name-2');

//password
const passwordlabel2 = document.getElementById('passwordlabel2');
const password2 = document.getElementById('lobby-password-2');

//nickname
const nicknamelabel2 = document.getElementById('label-for-nickname-2');
const nickname = document.getElementById('name2');

//go buttons
const button3 = document.getElementById('submitBtn1');
const button4 = document.getElementById('submitBtn1');


//Game lobby elements
const lobbymemberslabel = document.getElementById('lobby-members');
const lobbybox = document.getElementById('border-box');
const currentlobbydiv = document.getElementById('current-lobby-div');

//modal1 functions

button1.onclick = function() {
  modal1.style.display = "block";
}

span1.onclick = function() {
  modal1.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal1.style.display = "none";
  }
}

function setupHomepage(){
  button1.style.display = 'block';
  button2.style.display = 'block';
    
  form1.style.display = 'none';
  header1.style.display = 'none';


  lobbynamelabel1.style.display = 'none';
  lobbyname1.style.display = 'none';
  lobbypasswordlabel1.style.display = 'none';


  nicknamelabel1.style.display = 'none';
  nickname1.style.display = 'none';


  form2.style.display = 'none';
  header2.style.display = 'none';

  lobbynamelabel2.style.display = 'none';
  lobbyname2.style.display = 'none';

  passwordlabel2.style.display = 'none';
  password2.style.display = 'none';

  nicknamelabel2.style.display = 'none';
  nickname.style.display = 'none';

  button3.style.display = 'none';
  button4.style.display = 'none';

  lobbymemberslabel.style.display = 'none';
  lobbybox.style.display = 'none';
  currentlobbydiv.style.display = 'none';

}

function setupLobby(){
  button1.style.display = 'none';
  button2.style.display = 'none';
    
  form1.style.display = 'none';
  header1.style.display = 'none';


  lobbynamelabel1.style.display = 'none';
  lobbyname1.style.display = 'none';
  lobbypasswordlabel1.style.display = 'none';


  nicknamelabel1.style.display = 'none';
  nickname1.style.display = 'none';


  form2.style.display = 'none';
  header2.style.display = 'none';

  lobbynamelabel2.style.display = 'none';
  lobbyname2.style.display = 'none';

  passwordlabel2.style.display = 'none';
  password2.style.display = 'none';

  nicknamelabel2.style.display = 'none';
  nickname.style.display = 'none';

  button3.style.display = 'none';
  button4.style.display = 'none';

  lobbymemberslabel.style.display = 'block';
  lobbybox.style.display = 'block';
  currentlobbydiv.style.display = 'block';

  

}



