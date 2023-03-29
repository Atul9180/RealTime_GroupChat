const serverIp = "http://localhost:3000";
const userUrl = `${serverIp}/users`;
const chatUrl = `${serverIp}/chats`;
const logoutBtn = document.getElementById('logout-btn');
const ownerName = document.getElementById('ownerName');
let usersArea = document.getElementById('usersArea');
let messageInp = document.getElementById('messageInput');
const input = document.getElementById('image');
const msgSendBtn = document.getElementById('sendbtnicon');
const chatsContainer = document.querySelector(".Msgcontainer");
const socket = io(`${serverIp}`);
let username;
let state, group;
let allChatsAr = [];



//@desc: Event Listeners
logoutBtn.addEventListener('click', logout);
msgSendBtn.addEventListener('click', msgsend);
messageInp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        msgsend(e);
    }
})

//@desc: user token authentication
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
const userobj = { name: parsedToken.name, id: parsedToken.userId }



//@desc: showAllUsers List
async function showAddedMembers() {
    try {
        const response = await axios.get(`${userUrl}/getAllUsers`, { headers: { 'Authorization': state.token } })
        if (response) {

            socket.on('user-list', (userList) => {
                response.data.map(user => {
                    if (user.id !== state.userId) {
                        let isUserOnline = userList.includes(user.id) == 1 ? 'Online' : 'Offline';
                        const html = `
                <div class="singleUserChat friend-drawer friend-drawer--onhover" id='${user.id}' name='${user.name}'>
		  <img class="userProfile-image" src="../Assets/default_user_icon.png" alt="">
		  <div class="text">
			<span >${user.name}</span> <span class="onlnestatus">${isUserOnline}</span>
			<!-- <p class="text-muted">Hey, you're </p> -->
		  </div>
		  <!-- <span class="time text-muted small">13:21</span> -->
		</div>`
                        usersArea.innerHTML += html;
                    }
                    // usersArea.addEventListener('click', setSingleUserChatBox);
                })
            });
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
    const inputMessage = messageInp.value;
    const files = input.files;

    if (inputMessage === '' && !files.length || !parseInt(group)) { return; }

    let msgobj = {
        userId: state.userId,
        name: `${parsedToken.name}`,
        groupId: parseInt(group)
    };

    try {
        if (files.length > 0) {
            document.querySelector("#attachmenticon").style.backgroundColor = "green";
            document.getElementById('messageInput').readOnly = true;
            const file = files[0];
            const formData = new FormData();
            formData.append('image', file);
            const response = await axios.post(`${chatUrl}/upload`, formData, {
                headers: {
                    'Authorization': state.token,
                    'Content-Type': 'multipart/form-data'
                },
                params: { groupId: parseInt(group) }
            });

            if (response && response.data) {
                document.getElementById('messageInput').readOnly = false;
                document.querySelector("#attachmenticon").style.backgroundColor = "#fafafa";
                msgobj.message = response.data.message;
                allChatsAr.push(response.data);
            } else {
                throw new Error('Error uploading file');
            }
        } else if (inputMessage.length > 0) {
            msgobj.message = inputMessage;
            const sendResponse = await axios.post(`${chatUrl}/saveChatMsg`, msgobj, { headers: { 'Authorization': state.token } })
            allChatsAr.push(sendResponse.data)
        }

        showChatOnScreen(msgobj);
        socket.emit('sending_group_message', msgobj);
        localStorage.setItem('allChats', JSON.stringify(allChatsAr));
    } catch (err) {
        console.error("Error encountered in sending message: ", err);
        throw err;
    } finally {
        messageInp.value = "";
        input.value = null;
    }
}


//@desc: listen to other users new message :
socket.on('ReceivedGrpMessage', (data) => {
    if (data.groupId === parseInt(group))
        showChatOnScreen(data);
    allChatsAr.push(data)
    localStorage.setItem('allChats', JSON.stringify(allChatsAr))
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
        }
    }
    catch (err) {
        console.error(err);
    }
}


//desc: display messages on screen
async function showChatOnScreen(data) {
    try {
        let div = document.createElement('div');
        div.className = state.userId === data.userId ? "message right" : "message left";
        let content = "";
        if (data.message.startsWith("https://")) {
            // const imgtag = `<p><img data-src="${data.message}"  class="lozad attachmentsImages" id='${data.message}' style="width:70px; height:70px;" onclick="window.open('${data.message}', '_blank')" title="Click to download" /></p>`;
            const imgtag = `<p><img src="${data.message}"  class="attachmentsImages" loading="lazy"  id='${data.message}' style="width:70px; height:70px;" onclick="window.open('${data.message}', '_blank')" title="Click to download" /></p>`;
            content = div.className === "message right" ?
                `<h6>You:</h6>${imgtag}` :
                `<h6>${data.name}:</h6>${imgtag}`;
        }
        else {
            content = div.className === "message right" ?
                `<h6>You:</h6><p>${data.message}</p>` :
                `<h6>${data.name}:</h6><p>${data.message}</p>`;
        }
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
        sessionStorage.setItem('groupId', groupId)
        sessionStorage.setItem('groupName', groupName)
        chatsContainer.innerHTML = "";
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
    socket.emit("login", userobj);
});



const scrollDown = () => {
    chatsContainer.scrollTop = chatsContainer.scrollHeight;
};


