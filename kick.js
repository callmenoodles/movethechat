browser.runtime.onMessage.addListener((message) => {
  if (message.action === "changeDirection") {
    moveChat(message.position);
  }
});

function moveChat(direction) {
  direction =  direction ?? "right"
  
  const chat = document.getElementById("channel-chatroom");
  const main = document.querySelector("main");

  // Chat is inside main on mobile layouts
  if (chat && main && !main.contains(chat)) {
    const btnExpand = main.querySelector("button");
    const btnCollapse = chat.firstChild.querySelector("div");

    if (direction === "left") {
      main.before(chat);

      if (btnExpand) {
        btnExpand.firstChild.style.transform = "scale(-1,1)";
        btnExpand.parentElement.classList.replace("right-7", "ml-7");
      }

      if (btnCollapse) {
        btnCollapse.classList.add("absolute", "right-0");
        btnCollapse.querySelector("svg").style.transform = "scale(-1, 1)";
      }
    } else {
      main.after(chat);

      if (btnExpand) {
        btnExpand.firstChild.style.transform = "scale(1, 1)";
        btnExpand.parentElement.classList.replace("ml-7", "right-7");
      }

      if (btnCollapse) {
        btnCollapse.classList.remove("absolute", "right-0");
        btnCollapse.querySelector("svg").style.transform = "scale(1,1)";
      }
    }
  }
}

function init() {
  if (window.isChatObserving) {
    return;
  }

  window.isChatObserving = true;

  let currentUsername = null;
  let currentChatroomParent = null;
  let currentPlayerChildren = null;

  const observer = new MutationObserver(() => {
    const usernameElement = document.getElementById("channel-username");

    if (usernameElement) {
      const username = usernameElement.innerText.trim();

      if (username !== currentUsername) {
        currentUsername = username;

        browser.storage.local.get("direction").then((res) => {
          const direction = res.direction;
          moveChat(direction)
        });
      }
    }

    const chat = document.getElementById("channel-chatroom");

    if (chat) {
      if (chat.parentElement !== currentChatroomParent) {
        currentChatroomParent = chat.parentElement;

        browser.storage.local.get("direction").then((res) => {
          const direction = res.direction;
          moveChat(direction)
        });
      }
    }

    // HOTFIX: More than 2 elements?
    const player = document.getElementById("video-player").parentElement;
    if (player) {
      if (player.childElementCount !== currentPlayerChildren) {
        currentPlayerChildren = player.childElementCount;

        if (currentPlayerChildren > 1) {
          browser.storage.local.get("direction").then((result) => {
            const direction = result.direction || "right";
            const controls = player.lastChild;
              
            if (direction === "left") {
              console.log(controls.classList);
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
  document.addEventListener("DOMContentLoaded", initChatMover);

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "changeDirection") {
      moveChat(message.position);
    }
  });
} else {
  init();
}
