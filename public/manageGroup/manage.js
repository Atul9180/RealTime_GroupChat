var state, group;
const getProfileDesc = 'http://localhost:3000/group/getProfileDesc'
const makeAdmin = 'http://localhost:3000/makeAdmin'
const removeAsAdmin = 'http://localhost:3000/removeAsAdmin'
const removeUserFromGroup = 'http://localhost:3000/removeUserFromGroup'
const updateGroupsMembers = 'http://localhost:3000/updateGroupsMembers'
const addUsersToGroup = 'http://localhost:3000/addUsersToGroup'
const userUrl = 'http://localhost:3000/users'
let backBtn = document.getElementById('back')
let members, popup, targetUserId;
let leaveBtn = document.querySelector('.leave-group')
let addMembersPopup = document.getElementById('addMembersPopup')


//@desc: Add Event Listeners
backBtn.addEventListener('click', goBackToChat)
leaveBtn.addEventListener('click', leaveGroup)



//@desc: Check if already Logged In and Group ID exists
function checkAuthState() {
    state = JSON.parse(sessionStorage.getItem('auth'))
    group = sessionStorage.getItem('groupId')
    if (state == null || state == undefined || state == '') {
        location.replace('../index.html')
    } else if (state.token) {
        if (group == null || group == undefined || group == '') {
            location.replace('../chat/chatHome.html')
        }
        else {
            return
        }
    } else {
        location.replace('../index.html')
    }
}
checkAuthState()



//@desc: Back Button
function goBackToChat() {
    location.replace('../chat/chatHome.html')
}



//@desc: Leave Group(Exit)
async function leaveGroup() {
    try {
        const data = {
            groupid: parseInt(group),
            targetUserId: parseInt(state.userId)
        }
        const response = await axios.put(`${removeUserFromGroup}`, data,
            { headers: { 'Authorization': state.token } });

        if (response) {
            sessionStorage.removeItem('groupId')
            sessionStorage.removeItem('groupName')
            checkAuthState()
        }
    }
    catch (err) { console.log(err) }
}



//@desc:  Group Profile Info
async function showGroupProfileInfo() {
    try {
        const response = await axios.get(`${getProfileDesc}`, {
            params: {
                groupId: parseInt(group)
            },
            headers: { 'Authorization': state.token }
        });

        if (response) {
            members = response.data.users;
            let admins = JSON.parse(response.data.group.admins);
            document.querySelector('.group-name').textContent = response.data.group.name;
            document.querySelector('.group-info').textContent = `${members.length} participants`;

            let memberslist = document.querySelector('.group-participants');
            memberslist.innerHTML = "";

            if (admins.includes(state.userId)) {
                let addPDiv = document.createElement('div');
                addPDiv.className = "add-member sticky-top";
                let i = document.createElement('i');
                i.className = "fa-solid fa-user-plus";
                addPDiv.appendChild(i);
                let p = document.createElement('p');
                p.className = 'add-p';
                p.innerHTML = 'Add Participants';
                addPDiv.appendChild(p);
                addPDiv.id = 'add-member';
                i.id = 'add-member';
                p.id = 'add-member';

                addPDiv.setAttribute('data-bs-toggle', "modal");
                addPDiv.setAttribute('data-bs-target', "#staticBackdrop");

                memberslist.appendChild(addPDiv);
            }
            //mapping GroupMembers name,id to show groupmemberslist
            await Promise.all(members.map(async (user) => {
                let div = document.createElement('div');
                div.className = 'user';
                let img = document.createElement('img');
                img.src = "../Assets/default_user_icon.png";
                div.appendChild(img);
                let p = document.createElement('p');
                p.className = 'user-name';
                p.innerHTML = (user.id == state.userId) ? 'You' : `${user.name}`;
                div.appendChild(p);

                //if admins list includes any userId : (give admin tag) 
                if (admins.includes(user.id)) {
                    let span = document.createElement('span');
                    span.innerHTML = "Admin";
                    div.appendChild(span);
                }

                //if you are in admins list: ()
                if (admins.includes(state.userId)) {
                    //for other than you ..(add a down arrow with options : remove/add as admin, remove from group)
                    if (state.userId !== user.id) {
                        let i = document.createElement('i');
                        i.className = "fa-solid fa-angle-down";
                        div.appendChild(i);
                        let popup = document.createElement('div');
                        popup.className = 'user-popup';
                        let p2 = document.createElement('p');
                        p2.className = admins.includes(user.id) ? 'remove-admin' : 'make-admin';
                        p2.innerHTML = admins.includes(user.id) ? 'Dismiss as Admin' : 'Make Group Admin';
                        let p3 = document.createElement('p');
                        p3.className = 'remove-user';
                        p3.innerHTML = 'Remove from Group';
                        popup.appendChild(p2);
                        popup.appendChild(p3);
                        div.appendChild(popup);
                        popup.id = `popup${user.id}`;
                        div.id = user.id;
                        i.id = user.id;
                        p.id = user.id;
                        img.id = user.id;
                    }
                }
                memberslist.appendChild(div);
            }));

            if (admins.includes(state.userId)) {
                memberslist.addEventListener('click', showAdminPowerPopup);
            }
        }
    } catch (err) {
        console.log(err);
    }
}



//@desc: admin options popup:(make-admin, remove-admin)
async function showAdminPowerPopup(e) {
    if (popup !== undefined) {
        if (popup.style.display == 'flex') {
            const data = { groupid: parseInt(group), targetUserId: parseInt(targetUserId) };
            let response;

            try {
                switch (e.target.className) {
                    case 'make-admin':
                        response = await axios.put(`${makeAdmin}`, data, { headers: { 'Authorization': state.token } });
                        break;
                    case 'remove-admin':
                        response = await axios.put(`${removeAsAdmin}`, data, { headers: { 'Authorization': state.token } });
                        break;
                    case 'remove-user':
                        response = await axios.put(`${removeUserFromGroup}`, data, { headers: { 'Authorization': state.token } });
                        break;
                    default:
                        throw new Error('Invalid target class name');
                }

                if (response) {
                    showGroupProfileInfo();
                } else {
                    throw new Error('Error in applying admin power JS');
                }
            } catch (error) {
                console.log(error);
                throw new Error(error);
            } finally {
                popup.style.display = 'none';
                popup = undefined;
            }
        }
    }
    targetUserId = e.target.id;
    if (targetUserId !== '' && isNaN(targetUserId)) {
        addNewGroupMembers();
    } else if (targetUserId !== '' && !isNaN(targetUserId)) {
        // show Popup
        popup = document.getElementById(`popup${targetUserId}`);
        popup.style.display = 'flex';
    }
}



//@desc: in Popup Admin adding more members to group
async function addNewGroupMembers() {
    try {
        const response = await axios.get(`${addUsersToGroup}`, {
            params: {
                groupId: parseInt(group)
            },
            headers: { 'Authorization': state.token }
        });
        addMembersPopup.innerHTML = "";
        response.data.map(user => {

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
            document.querySelector('#createGroupForm').addEventListener('submit', adminAddUsersToGroup);

        })
    }
    catch (err) {
        console.error('error in loading new members');
        throw new Error(err);
    }
}



//@desc on submit btn calling to  update memeber to group :
async function adminAddUsersToGroup(e) {
    e.preventDefault();
    const selectedMembers = Array.from(document.querySelectorAll('#addMembersPopup input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
    if (selectedMembers.length === 0) {
        alert("choose atleast one user.!");
        return;
    }
    try {
        const newGroup = {
            id: parseInt(group),
            newmembers: selectedMembers
        };
        const response = await axios.put(`${updateGroupsMembers}`, newGroup, { headers: { 'Authorization': state.token } });
        createGroupForm.reset();
        if (response) {
            location.replace('../manageGroup/manage.html');
            return;
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}



//@desc: DOM
window.addEventListener('DOMContentLoaded', () => {
    showGroupProfileInfo()
})

