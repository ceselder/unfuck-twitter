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
  console.log("resp")
  output.textContent = "Scraping...";

  const bannedWords = bannedWordsInput.value
    .split("|")
    .map(w => w.trim())
    .filter(Boolean);

  const deleteMode = deleteModeCheckbox.checked;
  const openRouterKey = openRouterKeyInput.value;

  const tab = await getActiveTab();
  console.log("resp")
  const response = await browser.tabs.sendMessage(tab.id, {
    type: "SCRAPE_TWEETS",
    payload: {
      bannedWords,
      deleteMode,
      openRouterKey
    }
  });
  console.log("respge", response)
  output.textContent = JSON.stringify(response.tweets, null, 2);

});