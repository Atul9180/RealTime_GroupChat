var username;
var state, group;
var allChatsAr = [];
const serverIp = "http://localhost:3000";
const userUrl = `${serverIp}/users`;
const chatUrl = `${serverIp}/chats`;
const logoutBtn = document.getElementById('logout-btn');
const ownerName = document.getElementById('ownerName');
let usersArea = document.getElementById('usersArea');
let messageInp = document.getElementById('messageInput');
const msgSendBtn = document.getElementById('sendbtnicon');
const chatsContainer = document.querySelector(".Msgcontainer");
const socket = io(`${serverIp}`);



// Event Listeners
logoutBtn.addEventListener('click', logout);
msgSendBtn.addEventListener('click', msgsend);


//user token authentication
async function checkAuthState() {
    state = await JSON.parse(sessionStorage.getItem('auth'))
    group = sessionStorage.getItem('groupId')
    if (state == null || state == undefined || state == '') {
        location.replace('../index.html')
    } else if (state.token) {
        return
    } else {
        location.replace('../index.html')
    }
}
checkAuthState()



//@desc: logout
async function logout() {
    await holdLimitedMsgs();
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('groupId');
    sessionStorage.removeItem('groupName');
    localStorage.removeItem('allChats');
    checkAuthState();
}



//jwt token parser (parsedToken.email,parsedToken.name,parsedToken.userId)
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
let parsedToken = parseJwt(sessionStorage.getItem('auth'));



//@desc: showAllUsers List
async function showAddedMembers() {
    try {
        const response = await axios.get(`${userUrl}/getAllUsers`, { headers: { 'Authorization': state.token } })
        if (response) {
            response.data.map(user => {
                if (user.id !== state.userId) {
                    const html = `
                <div class="singleUserChat friend-drawer friend-drawer--onhover" id='${user.id}' name='${user.name}'>
		  <img class="userProfile-image" src="../Assets/default_user_icon.png" alt="">
		  <div class="text">
			<span >${user.name}</span>
			<!-- <p class="text-muted">Hey, you're </p> -->
		  </div>
		  <!-- <span class="time text-muted small">13:21</span> -->
		</div>
                `
                    usersArea.innerHTML += html;
                }
            })
            // usersArea.addEventListener('click', setSingleUserChatBox);
        }
    }
    catch (error) {
        console.log(error)
        throw new Error(error)
    }
}



//@desc: sending msg method:
async function msgsend(e) {
    e.preventDefault();
    let inputMessage = messageInp.value;
    try {
        if (inputMessage.trim().length == 0 || !parseInt(group)) {
            return;
        }
        else {
            const msgobj = {
                userId: state.userId,
                message: inputMessage,
                name: `${parsedToken.name}`,
                groupId: parseInt(group)
            }
            showChatOnScreen(msgobj);
            socket.emit('sending_group_message', msgobj);
            const sendResponse = await axios.post(`${chatUrl}/saveChatMsg`, msgobj, { headers: { 'Authorization': state.token } })
            if (sendResponse.data && Array.isArray(sendResponse.data) && sendResponse.data.length > 0) {
                allChatsAr = [...allChatsAr, ...sendResponse.data]
                // showChatOnScreen(sendResponse.data)
            }
        }
    }
    catch (err) {
        console.log("error encountered in sending msg: ", err);
        throw err;
    }
    finally {
        messageInp.value = "";
    }
}



//listen to other users new message :
socket.on('ReceivedGrpMessage', (data) => {
    if (data.groupId === parseInt(group))
        showChatOnScreen(data);
});



//@desc: getall chats..
async function getAllChats() {
    try {
        allChatsAr = JSON.parse(localStorage.getItem('allChats'));
        let response;
        if (!allChatsAr || allChatsAr.length === 0) {
            response = await axios.get(`${chatUrl}/getAllChats`, {
                params: { groupId: group },
                headers: { 'Authorization': state.token }
            });
            const chatList = response.data;
            if (chatList.length === 0 || !chatList) {
                chatsContainer.innerHTML = `<div class="message center">No new Chat Yet!</div>`;
                return;
            }
            chatsContainer.innerHTML = '';
            allChatsAr = [...chatList]
            localStorage.setItem('allChats', JSON.stringify(chatList))
            chatList.forEach(chat => {
                showChatOnScreen(chat);
            })
        }
        else {
            allChatsAr.forEach(chat => showChatOnScreen(chat));
            // await findOtherUsersChat();
        }
    }
    catch (err) {
        console.error(err);
    }
}


//@desc: load otherusers send chats
// async function findOtherUsersChat() {
//     try {
//         const id = allChatsAr[allChatsAr.length - 1].id;
//         const isNewChat = await axios.get(`${chatUrl}/getnewChats`, {
//             params: { id, groupId: group }, headers: { 'Authorization': state.token }
//         });
//         if (isNewChat.data.length > 0) {
//             allChatsAr = [...allChatsAr, ...isNewChat.data]
//             return isNewChat.data.map(chat => { showChatOnScreen(chat) });
//         }
//     }
//     catch (err) {
//         console.log(err);
//     }
// }



//desc: to showChatsOnScreen
// async function showChatOnScreen(chat) {
//     try {
//         const { id, userId, name, message } = chat;
//         //console.table({userId,id, name, message});
//         const div = document.createElement("div");
//         div.className = state.userId === userId ? "message right" : "message left";
//         div.textContent = state.userId === userId ? `You: ${message}` : `${name}: ${message}`;
//         chatsContainer.appendChild(div);
//         scrollDown();
//     }
//     catch (err) {
//         console.error(err)
//     }
// }

async function showChatOnScreen(data) {
    try {
        let div = document.createElement('div');
        // div.classList.add('message', status);
        div.className = state.userId === data.userId ? "message right" : "message left";
        let content = status === 'right' ? `<h6>You:</h6><p>${data.message}</p>` : `<h6>${data.name}:</h6><p>${data.message}</p>`;
        div.innerHTML += content;
        chatsContainer.appendChild(div);
        scrollDown();
    }
    catch (err) {
        console.error(err)
    }
}




//@desc: setting chatbox Profile header(name,image)
async function setGroupChatHeader() {
    try {
        let header = document.querySelector('#grpChatProfile');
        header.setAttribute('groupId', sessionStorage.getItem('groupId'));
        header.classList.add('group', 'sticky-top')
        let grpImg = document.createElement('img');
        grpImg.className = 'profile-image';
        grpImg.src = "../Assets/default_icon.png";
        header.appendChild(grpImg);
        let grpname = document.createElement('span');
        grpname.innerHTML = sessionStorage.getItem('groupName');
        grpname.classList = 'chatBoxNameStatus';
        grpname.setAttribute('name', sessionStorage.getItem('groupName'));
        header.appendChild(grpname);
        // Msgcontainer.appendChild(header);
        header.addEventListener('click', manageGroup);
    }
    catch (err) {
        console.error(err)
        throw new Error(err);
    }
}



//@desc: logic to show Group Profile info..
function manageGroup(e) {
    location.href = '../manageGroup/manage.html'
}



//@desc: logic to hold only 10 msg in localStorage
async function holdLimitedMsgs() {
    try {
        if (allChatsAr.length > 10) {
            allChatsAr.splice(0, allChatsAr.length - 10);
            localStorage.setItem('allChats', JSON.stringify(allChatsAr));
        }
    }
    catch (er) {
        console.log(er);
    }
}



//@desc: showChat data once group selected, Called from groups.js
async function SetGrpChats(e) {
    let clickedElement = e.target;
    while (clickedElement && !clickedElement.classList.contains('group')) {
        clickedElement = clickedElement.parentNode;
    }
    if (clickedElement) {
        const groupId = clickedElement.id;
        const groupName = clickedElement.getAttribute('name');
        // console.log({ groupName, groupId })
        chatsContainer.innerHTML = "";
        sessionStorage.setItem('groupId', groupId)
        sessionStorage.setItem('groupName', groupName)
        localStorage.removeItem('allChats')
        if (sessionStorage.getItem('groupId') && sessionStorage.getItem('groupName')) {
            Promise.all([setGroupChatHeader(), getAllChats()]);
            location.href = '../chat/chatHome.html';
        }
    }
}



//@desc: onLoad Methods
window.addEventListener('DOMContentLoaded', async () => {
    ownerName.innerText = `${parsedToken.name}`;
    Promise.all([showAddedMembers(), getAllChats(), setGroupChatHeader()])
    //setInterval(findOtherUsersChat, 1000);
});



const scrollDown = () => {
    chatsContainer.scrollTop = chatsContainer.scrollHeight;
};


