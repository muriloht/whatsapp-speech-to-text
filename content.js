async function getLocalStorageValue(key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(key, function (value) {
        resolve(value);
      })
    }
    catch (ex) {
      reject(ex);
    }
  });
}

let observer = new MutationObserver(mutations => {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      for (let elem of node.querySelectorAll('audio')) {
        let trl = document.createElement("P");
        let imgLoading = document.createElement('img');
        imgLoading.src = chrome.runtime.getURL('loading.gif');
        imgLoading.style.display = "none";
        imgLoading.width = "24";
        imgLoading.height = "24";

        const btn = document.createElement('button');
        btn.textContent = chrome.i18n.getMessage("transcribe");
        btn.onclick = async function () {
          btn.style.display = "none";
          imgLoading.style.display = "inline";

          let b64;
          const savedAPIKey = await getLocalStorageValue("apiKey");
          let savedLanguageKey = await getLocalStorageValue("languageKey");
          await fetch(elem.src, {
            method: 'GET'
          }).then(response => response.ok && response.arrayBuffer())
            .then(buffer => {
              let bytes = new Uint8Array(buffer);
              let binary = String.fromCharCode.apply(null, bytes);
              let data = {
                "config": {
                  "encoding": "OGG_OPUS",
                  "sampleRateHertz": 16000,
                  "languageCode": savedLanguageKey.languageKey,
                  "enableWordTimeOffsets": false
                },
                "audio": {
                  "content": btoa(binary)
                }
              };

              let url = new URL('https://speech.googleapis.com/v1/speech:recognize');
              let params = { key: savedAPIKey.apiKey };
              url.search = new URLSearchParams(params).toString();

              fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
              })
                .then(response => response.json())
                .then(data => {
                  if (data.results != null) {
                    trl.innerHTML = "<br/>" + data.results[0].alternatives[0].transcript + "<br/><br/>";
                  } else {
                    trl.innerHTML = "<br/>Não foi possível converter a mensagem. <br/><br/>";
                    btn.style.display = "block";
                  }
                })
                .catch((error) => {
                  trl.innerHTML = "<br/>" + error + "<br/><br/>";
                  btn.style.display = "block";
                })
                .finally(() => {
                  imgLoading.style.display = "none";
                });
            })
            .catch(err => console.error(err));
        }
        elem.parentElement.appendChild(btn);
        elem.parentElement.appendChild(imgLoading);
        elem.parentElement.appendChild(trl);
      }
    }
  }

});

observer.observe(document.body, { childList: true, subtree: true });