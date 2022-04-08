class Message {
    constructor(text) {
        this.text = text;
        const d = new Date();
        this.time = d.toLocaleTimeString().substring(0, 5);
    }
}

const apiKey = "f72F2vdXi0CcohbPkJLCTBYmKuGaes6X";
let messagesList = [];
let gifsList = [];
const messagesContainer = document.querySelector('.main-page_messages-area');
const gifsContainer = document.querySelector('.main-page_gifs-area');
let input = document.querySelector('.main-page_input-area_input');
let wasScrolled = false;

// Отправка сообщения
input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        gifsContainer.setAttribute("style", "visibility:hidden");
        getAndSendMessage();
    }
});

// Если ввод сообщения продолжается (если ищем гифки, то по дефолту прогружаем первые 10)
input.addEventListener('input', function () {
    if (this.value.startsWith("/gif")) {
        sendGif(this.value, 10);
        wasScrolled = false;
    } else {
        gifsContainer.setAttribute("style", "visibility:hidden");
    }
});

// Если пользователь начал "скроллить" ленту с гифками, догружаем остальные гифки
gifsContainer.addEventListener('scroll', function () {
    if (!wasScrolled) {
        sendGif(input.value, 100);
        wasScrolled = true;
    }
});

function getAndSendMessage() {
    let message = document.querySelector('.main-page_input-area_input');

    // Проверка на пустой ввод и защита от вредоносных инъекций XSS
    if (message.value === "" || (message.value.includes("<script>"))) {
        message.value = "";
        return;
    }

    let messageElement = new Message(message.value);
    messagesList.push(messageElement);

    sendMessage(messageElement);
    message.value = "";
}

function sendGif(message,  limit) {
    gifsContainer.setAttribute("style", "visibility:visible");

    if (limit === 10) {
        gifsContainer.innerHTML = "";
        gifsList = [];
    }

    searchGiphy(message.substring(5, message.length), limit);
}

function sendMessage(message) {
    const element = document.createElement("section");
    element.classList.add("main-page_messages-area_message-" + messagesList.length);
    element.innerHTML =
        `<h4 class="main-page_messages-area_message__text-${messagesList.length}">
            ${message.text}
         </h4>
         <time class="main-page_messages-area_message__time-${messagesList.length}">
            ${message.time}
         </time>`;
    messagesContainer.appendChild(element);
}

function sendGifAfterClick(image) {
    let message = new Message("");
    messagesList.push(message);

    const src = image.images.fixed_height.url;
    gifsContainer.setAttribute("style", "visibility:hidden");

    const element = document.createElement("section");
    element.classList.add("main-page_messages-area_message-" + messagesList.length);
    element.innerHTML =
        `<img class="main-page_messages-area_message__text-${messagesList.length}" src="${src}" alt="gif-element">
         <time class="main-page_messages-area_message__time-${messagesList.length}">
            ${message.time}
         </time>`;

    messagesContainer.appendChild(element);
    gifsList = [];
    gifsContainer.innerHTML = '';
    document.querySelector('.main-page_input-area_input').value = "";
}

function searchGiphy(searchQuery, limit) {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${searchQuery}&limit=${limit}`;

    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.send();

    request.addEventListener('load', function () {
        pushToDOM(this.response, searchQuery, limit);
    });
}

function pushToDOM(response, searchQuery, limit) {
    response = JSON.parse(response);
    const images = response.data;

    if (!images.length) {
        gifsContainer.innerHTML = `<h1>No results found =(<h1>`;
        gifsList = [];
        return;
    }

    let i = 0
    images.forEach(function (image) {
        i++
        if (limit === 10 || i > 10) {
            const src = image.images.fixed_height.url;
            gifsList.push(src)

            const element = document.createElement("div");
            element.classList.add("main-page_gifs-area_gif-" + gifsList.length);
            element.innerHTML =
                `<img class="main-page_gifs-area_gif" src="${src}" alt="gif-${searchQuery}">`;

            element.addEventListener('click', function () {
                sendGifAfterClick(image);
            });
            element.addEventListener('mouseover', function () {
                element.getElementsByTagName("img")[0].style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
            });
            element.addEventListener('mouseleave', function () {
                element.getElementsByTagName("img")[0].style.boxShadow = '0 0 0px rgba(0,0,0,0)';
            });

            gifsContainer.appendChild(element);
        }
    });
}
