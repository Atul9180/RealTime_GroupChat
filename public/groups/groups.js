var state;
let groupsIp = 'http://localhost:3000/groups'
let userIp = 'http://localhost:3000/users'


let CreateGroupModelPop = document.getElementById("createGroupModelAndGetUsers");
let addMembersPopup = document.getElementById('add-members-popup')
const createGroupForm = document.querySelector('#createGroupForm');


let groupNameInp = document.getElementById('groupName')


// Event Listeners
CreateGroupModelPop.addEventListener('click', showMembersToAddInGroup)



//@desc: User already logged in check..
async function checkAuthState() {
    state = await JSON.parse(sessionStorage.getItem('auth'))
    if (state == null || state == undefined || state == '') {
        location.replace('../index.html')
    } else if (state.token) {
        return
    } else {
        location.replace('../index.html')
    }
}
checkAuthState()



//jwt token parser
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}




//desc: Add event listener to modal on close to clear the inputs
const modal = document.querySelector('#staticBackdrop');
modal.addEventListener('hidden.bs.modal', () => {
    createGroupForm.reset();
});



//@desc: createGroup Model popup: Load With non-member Users list:
async function showMembersToAddInGroup() {
    try {
        const response = await axios.get(`${userIp}/getAllUsers`, { headers: { 'Authorization': state.token } })
        if (response) {
            addMembersPopup.innerHTML = "";
            response.data.map(user => {
                if (user.id !== state.userId) {
                    let div = document.createElement('div');
                    div.className = 'member';
                    div.id = `option${user.id}`;
                    const label = document.createElement('label');
                    label.htmlFor = `option${user.id}`;
                    label.textContent = `${user.name}`;
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `option${user.id}`;
                    checkbox.value = `${user.id}`;

                    div.appendChild(checkbox);
                    div.appendChild(label);
                    addMembersPopup.appendChild(div);
                }
            })
        }
    }
    catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


//@desc: createGroup validation logic on 
createGroupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const groupNameInp = document.querySelector('#groupName').value;
    if (!groupNameInp) {
        alert('Please enter a group name');
        return;
    }
    const options = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    if (options.length < 2) {
        alert('Please select at least 2 Members:');
        return;
    }
    const newGroup = {
        name: groupNameInp,
        members: options
    };
    await createGroup(newGroup)
    createGroupForm.reset();
});



//@desc: save and create new group
async function createGroup(data) {
    try {
        const response = await axios.post(`${groupsIp}`, data, { headers: { 'Authorization': state.token } });
        if (response.status == 201) {
            alert("New Group Created!");
            //document.getElementById('staticBackdrop').classList.remove('show');
            //location.replace('../chat/chatHome.html')
            document.getElementById('staticBackdrop').modal('hide');
            showGroups();
            return;
        } else if (response.status == 400) {
            alert(`Group of Same name already exists. Error:${response.status}`);
            return;
        }
    } catch (err) {
        console.log(err.message);
        throw new Error(err);
    }
}



//@desc:  show Groups you are member of: 
//SetGrpChats: definition inside chatHome.js
async function showGroups() {
    try {
        const response = await axios.get(`${groupsIp}`, { headers: { 'Authorization': state.token } })
        let groupList = document.querySelector('.groups-container')
        groupList.innerHTML = "";
        if (response.data.length == 0) {
            let p = document.createElement('p');
            p.innerHTML = "No Groups Exists!";
            groupList.appendChild(p);
        } else if (response.data.length > 0) {
            response.data.map(group => {
                let div = document.createElement('div');
                div.className = 'group';
                div.style.display = "flex";
                div.id = group.id;
                div.setAttribute('name', `${group.name}`);
                let img = document.createElement('img');
                img.src = "../Assets/default_icon.png";
                img.className = "userProfile-image";
                let p = document.createElement('p');
                p.innerHTML = group.name;
                div.appendChild(img);
                div.appendChild(p);
                groupList.appendChild(div);
            });
            groupList.addEventListener('click', SetGrpChats);
        }
    } catch (error) {
        console.log(error);
    }
}



window.addEventListener('DOMContentLoaded', showGroups)

