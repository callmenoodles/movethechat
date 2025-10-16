const runtime =
  typeof browser === "undefined" ? chrome.runtime : browser.runtime;

runtime.onMessage.addListener((message) => {
  if (message.action === "changeDirection") {
    moveChat(message.position);
  }
});

function moveChat(direction) {
  direction = direction ?? "right";

  const chat = document.getElementById("channel-chatroom");
  const main = document.querySelector("main");
  const messages = document.getElementById("chatroom-messages");
  const scrollPosition = messages.scrollTop;
  
  // Chat is inside main on mobile layouts
  if (chat && main && !main.contains(chat)) {
    const btnExpand = main.querySelector("button");
    const btnCollapse = chat.firstChild.querySelector("div");
    const btnExpandText = btnExpand.querySelector("span");
    const btnExpandIcon = btnExpand.querySelector("svg");

    if (direction === "left") {
      main.before(chat);

      if (btnExpand) { 
        btnExpandIcon.style.transform = "scale(-1,1)";
        btnExpand.parentElement.classList.replace("right-7", "ml-7");
        btnExpandText.after(btnExpandIcon);
      }

      if (btnCollapse) {
        btnCollapse.classList.add("absolute", "right-0");
        btnCollapse.querySelector("svg").style.transform = "scale(-1, 1)";
      }
    } else {
      main.after(chat);

      if (btnExpand) {
        btnExpandIcon.style.transform = "scale(1, 1)";
        btnExpand.parentElement.classList.replace("ml-7", "right-7");
        btnExpandText.before(btnExpandIcon);
      }

      if (btnCollapse) {
        btnCollapse.classList.remove("absolute", "right-0");
        btnCollapse.querySelector("svg").style.transform = "scale(1,1)";
      }
    }
    
    messages.scrollTop = scrollPosition;
  }
}

function init() {
  let currentUsername = null;
  let currentChatroomParent = null;
  let currentPlayerChildren = null;

  const observer = new MutationObserver(() => {
    const usernameElement = document.getElementById("channel-username");
    const storage =
      typeof browser === "undefined" ? chrome.storage : browser.storage;

    if (usernameElement) {
      const username = usernameElement.innerText.trim();

      if (username !== currentUsername) {
        currentUsername = username;

        storage.local.get("direction").then((res) => {
          const direction = res.direction;
          moveChat(direction);
        });
      }
    }

    const chat = document.getElementById("channel-chatroom");

    if (chat) {
      if (chat.parentElement !== currentChatroomParent) {
        currentChatroomParent = chat.parentElement;

        storage.local.get("direction").then((res) => {
          const direction = res.direction;
          moveChat(direction);
        });
      }
    }

    // HOTFIX: More than 2 elements?
    const video = document.getElementById("video-player");
    const player = video.parentElement;
    if (player) {
      if (player.childElementCount !== currentPlayerChildren) {
        currentPlayerChildren = player.childElementCount;

        if (currentPlayerChildren > 1) {
          storage.local.get("direction").then((result) => {
            const direction = result.direction || "right";
            const controls = player.lastChild;

            if (direction === "left") {
              controls.classList.replace("left-0", "right-0");
            } else {
              controls.classList.replace("right-0", "left-0");
            }
          });
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.info("[Move The Chat]: Initialized");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
