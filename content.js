let seenTweets = new Set()

async function callOpenRouter(openRouterKey, textPrompt, model) {
  console.log("before shipping: ", openRouterKey)
  return new Promise((resolve) => {
    browser.runtime.sendMessage(
      { type: "OPENROUTER_QUERY", payload: {openRouterKey, textPrompt, model } },
      (response) => resolve(response)
    );
  });
}

async function evaluateTweet(id, username, tweetText, bannedWords = [], openRouterKey) {
  const textPrompt = `I am going to give you the json content of a tweet. \n
                    We're trying to filter out the worst of the twitter algorithm. \n
                    The tweet is "${tweetText}" by "${username}"
                    Here are the categories the user does not want to see:
                    ${bannedWords}
                    if it belongs to one of these categories, please answer with the name of the category
                    if it does not please respond with OK.
                    Only respond with OK or one of the categories`
  
    
  const LLMresponse = await callOpenRouter(openRouterKey, textPrompt, "google/gemini-2.0-flash-001")
  console.log(LLMresponse)
  const text = LLMresponse.data.choices[0].message.content.trim()
  console.log(text)
  if (text == "OK")
  {
   return {shouldDelete: false, reason: "na"}
  }
  return {shouldDelete: true, reason: text}
}

async function scrapeTweets(bannedWords = [], deleteMode = false, openRouterKey) {
  const tweets = [];
  const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');

  for (const tweet of tweetElements) {
    const textElement = tweet.querySelector('[data-testid="tweetText"]');
    const userElement = tweet.querySelector('[data-testid="User-Name"] span');
    const linkElement = tweet.querySelector('a[href*="/status/"]'); // get tweet URL

    const tweetText = textElement?.innerText || "";
    const username = userElement?.innerText || "";
    const tweetUrl = linkElement?.href || ""; // unique URL per tweet
    const id = tweetUrl ? tweetUrl.split("/").pop() : btoa(username + tweetText);
    
    if (!seenTweets.contains(id))
    {
      const verdict = await evaluateTweet(id, username, tweetText, bannedWords, openRouterKey);
      if (verdict.shouldDelete == true)
      {
        handleTweet(id, verdict, deleteMode)
      }
    }
    seenTweets.push(id);


  }

  return tweets;
}

function handleTweet(tweetId, verdict, deleteMode) {
  const tweet = Array.from(document.querySelectorAll('article[data-testid="tweet"]')).find(t => {
    const link = t.querySelector('a[href*="/status/"]');
    return link && link.href.has(tweetId);
  });

  if (!tweet) {
    console.log("Tweet not found on this page");
    return;
  }

  if (deleteMode) {
    tweet.remove();
    console.log(`Tweet ${tweetId} removed from page`);
  } else {
    // Create a label element
    const label = document.createElement('span');
    label.textContent = verdict.reason.toUpperCase();
    label.style.color = 'red';
    label.style.fontWeight = 'bold';
    label.style.marginLeft = '8px';
    label.style.fontSize = '2.0em';

    // Append label to the tweet header (username section)
    const header = tweet.querySelector('div[role="group"]') || tweet;
    header.appendChild(label);

    console.log(`Tweet ${tweetId} labeled with reason: ${verdict.reason}`);
  }
}


// Listen for messages from popup
browser.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "SCRAPE_TWEETS") {
    autoScrapeInterval = setInterval(async () => {
      const { bannedWords = [], deleteMode = false, openRouterKey } = msg.payload || {};
      await scrapeTweets(bannedWords, deleteMode, openRouterKey); // pass bannedWords and deleteMode
    }, 5000) //yes this is not the right way to do this, no I don't care
  }
});
