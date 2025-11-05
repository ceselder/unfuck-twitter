const button = document.getElementById("scrapeBtn");
const output = document.getElementById("output");
const bannedWordsInput = document.getElementById("bannedWordsInput"); // comma-separated
const deleteModeCheckbox = document.getElementById("deleteCheckbox"); // checkbox
const openRouterKeyInput = document.getElementById("openRouterKey");


async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

button.addEventListener("click", async () => {

  const bannedWords = bannedWordsInput.value
    .split("|")
    .map(w => w.trim())
    .filter(Boolean);

  const deleteMode = deleteModeCheckbox.checked;
  const openRouterKey = await browser.storage.local.get("openRouterKey");
  console.log(openRouterKey)

  const tab = await getActiveTab();
  const response = await browser.tabs.sendMessage(tab.id, {
    type: "SCRAPE_TWEETS",
    payload: {
      bannedWords,
      deleteMode,
      openRouterKey
    }
  });
  output.textContent = JSON.stringify(response.tweets, null, 2);

});