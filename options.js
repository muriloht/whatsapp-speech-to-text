// Saves options to chrome.storage
function save_options() {
  var apiKey = document.getElementById('apiKey').value;
  var languageKey = document.getElementById('languageKey').value;
  var enableAutomaticPunctuation = document.getElementById('enableAutomaticPunctuation').value;
  var encoding = document.getElementById('encoding').value;
  var model = document.getElementById('model').value;
  chrome.storage.sync.set({
    apiKey: apiKey,
    languageKey: languageKey,
    enableAutomaticPunctuation: enableAutomaticPunctuation,
    encoding: encoding,
    model: model
  }, function () {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

// Restores values based on storage or default
function restore_options() {

  chrome.storage.sync.get({
    apiKey: 'N/D',
    languageKey: 'pt_BR',
    enableAutomaticPunctuation: true,
    encoding: 'LINEAR16',
    model: 'default'
  }, function (items) {
    document.getElementById('apiKey').value = items.apiKey;
    document.getElementById('languageKey').value = items.languageKey;
    document.getElementById('enableAutomaticPunctuation').checked = items.enableAutomaticPunctuation;
    document.getElementById('encoding').value = items.encoding;
    document.getElementById('model').value = items.model;
  });
}

// Localize by replacing __MSG_***__ meta tags
// https://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension
function localizeHtmlPage() {
  var objects = document.getElementsByTagName('html');
  for (var j = 0; j < objects.length; j++) {
    var obj = objects[j];
    var valStrH = obj.innerHTML.toString();
    var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
      return v1 ? chrome.i18n.getMessage(v1) : "";
    });
    if (valNewH != valStrH) {
      obj.innerHTML = valNewH;
    }
  }
}

localizeHtmlPage();
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);