
// Set Active Class
function setActive(button) {
    document.querySelectorAll('.chat-item').forEach(items => {
        items.classList.remove('active');
        button.classList.add('active')
    })
}

// Get Htmx request Events
document.body.addEventListener('htmx:configRequest', function (event) {
    if (event.detail.target.id === 'chatMessage') {
        const sendForm = document.getElementById('chat-submit');
        const chatWelcomeScreen = document.getElementById('chat-welcome');
        sendForm.style.display = "block";
        chatWelcomeScreen.remove();
    }
    if (event.detail.path === '/mockapi/sendMessage' && event.detail.verb === 'post') {
        event.preventDefault();
        const data = new FormData(event.detail.elt);
        const message = data.get("message");

        const html = `
            <div class="live-message">
        <div class="current-user">
            <div class="chat-image" style="background-image: url(./assets//images/user/user.png)"></div>
            <div class="user">
                <p>${message}</p>
            </div>
        </div>
    </div>
        `
        event.detail.target.insertAdjacentHTML('beforeend', html);
        htmx.process(event.detail.target);

        const messageID = document.getElementById('message');
        messageID.value = '';
    }
})


// Get Htmx confirm Events
document.body.addEventListener('htmx:confirm', function (evt) {
    if (evt.detail.path.startsWith('/delete-room') && evt.detail.verb === "delete") {
        evt.preventDefault();
        Swal.fire({
            title: "Are you sure?",
            text: evt.detail.question,
            icon: "warning",
            buttons: true,
            dangerMode: true,
            preConfirm: () => {
                // evt.detail.issueRequest();
                const url = new URL('http://mock.com' + evt.detail.path)
                const id = url.searchParams.get('id')
                const currentID = document.getElementById(id)
                currentID.remove();
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
    }
    if (evt.detail.path.startsWith('/edit-room') && evt.detail.verb === "put") {
        evt.preventDefault();
        Swal.fire({
            title: evt.detail.question,
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Change Name",
            showLoaderOnConfirm: true,
            preConfirm: (nameChange) => {
                const url = new URL('http://mock.com' + evt.detail.path);
                const id = url.searchParams.get('id');
                const currentID = document.getElementById(id);
                if (currentID) {
                    const element = currentID.querySelector('.chat-name')
                    if (element) {
                        element.innerText = nameChange;
                    }
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: `Room Name Changed`,
                });
            }
        });
    }
});


// invite funtion using HTMX on click
function inviteFunc(name) {
    Swal.fire({
        title: "Are you sure you want to join this Chat Room?",
        icon: "success",
        buttons: true,
        preConfirm: () => {
            const joinChatRoom = document.getElementById('chat-room-joined');
            const invite = document.getElementById(name)
            const clone = invite.cloneNode(true)
            const tags = clone.querySelector('.chat-item-clickable')
            if (tags) {
                tags.setAttribute('hx-get', `./mockapi/${name}.html`);
                tags.setAttribute('hx-target', '#chatMessage');
                tags.setAttribute('hx-swap', 'innerHTML');
            }
            const button = clone.querySelector("button");
            if (button) {
                button.remove();
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete';
            deleteBtn.setAttribute('hx-delete', `/delete-room?id=${name}`);
            deleteBtn.setAttribute('hx-confirm', 'Are you sure? You want to delete this chat');
            deleteBtn.innerHTML = `<svg>
            <path d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

            clone.appendChild(deleteBtn)
            joinChatRoom.appendChild(clone)
            htmx.process(clone);
            invite.remove();
        },
        allowOutsideClick: () => !Swal.isLoading()
    })
}