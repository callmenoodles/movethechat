browser.storage.local.get("direction").then((res) => {
  const direction = res.direction || "right";
  const radioButton = document.getElementById(direction);
  radioButton.checked = true;
});

document.querySelectorAll('input[name="direction"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    if (radio.checked) {
      const value = radio.value;

      browser.storage.local.set({
        direction: value,
      });

      browser.tabs
        .query({
          active: true,
          currentWindow: true,
        })
        .then((tabs) => {
          browser.tabs
            .sendMessage(tabs[0].id, {
              action: "changeDirection",
              position: value,
            })
            .catch((error) => {
              console.error(
                "[Move The Chat]: Error sending data to tab:",
                error,
              );
            });
        });
    }
  });
});
