'use strict';

let targetTime;
let isSniping = false;

/**
 * Starts the sniping process.
 * @param {number} targetTime - The target time for sniping.
 */
function startSniping(targetTime_) {
  targetTime = targetTime_;

  isSniping = true;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {
      type: 'START_SNIPING',
      payload: { targetTime },
    });
  });
}

function stopSniping() {
  isSniping = false;

  // TODO: Could send message to content script to stop sniping
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_SNIPING') {
    startSniping(request.payload.targetTime);
  } else if (request.type === 'STOP_SNIPING') {
    stopSniping();
  } else if (request.type === 'CHECK_SNIPING_STATUS') {
    sendResponse({
      payload: {
        isSniping: isSniping,
      },
    });
  } else if (request.type === 'IS_SNIPING') {
    sendResponse({
      payload: {
        isSniping: isSniping,
        targetTime: targetTime,
      },
    });
  } else if (request.type === 'SUCCESFULLY_BOOKED') {
    isSniping = false;
  }
});
