async function openRouterQuery(openRouterKey, textPrompt, model) {
  console.log("credentials:")
    console.log({ openRouterKey, textPrompt, model })
    
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterKey.openRouterKey}`, //idk why i implemented it like this but idc anymore
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: textPrompt }],
    }),
  });

  return await res.json();
}

// Listen for messages from content/popup scripts
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "OPENROUTER_QUERY") {
    const { openRouterKey, textPrompt, model } = msg.payload;

    openRouterQuery(openRouterKey, textPrompt, model)
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});

