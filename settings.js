const apiKeyInput = document.getElementById("apiKeyInput");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

// Load saved key on page load
document.addEventListener("DOMContentLoaded", async () => {
  const result = await browser.storage.local.get("openRouterKey");
  if (result.openRouterKey) {
    apiKeyInput.value = result.openRouterKey;
  }
});

// Save key when button clicked
saveBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    status.textContent = "Please enter a valid API key!";
    return;
  }
  await browser.storage.local.set({ openRouterKey: key });
  status.textContent = "API key saved successfully!";
});
