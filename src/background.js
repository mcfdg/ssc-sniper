'use strict';

const LOAD_TIME = 3000;
const RELOAD_TIME = 10000;

let refreshInterval;
let targetTime;

/**
 * Reloads the specified tab and sends a message to attempt booking at the target time.
 * @param {chrome.tabs.Tab} tab - The tab to reload and send the message to.
 * @param {number} targetTime - The target time for booking.
 */
function reloadAndSnipe(tab, targetTime) {
  chrome.tabs.reload(tab.id);

  setTimeout(() => {
    chrome.tabs.sendMessage(
      tab.id,
      { type: 'ATTEMPT_BOOKING', payload: { targetTime } },
      (response) => {
        if (response.payload.success) {
          stopSniping();

          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon_128.png',
            title: 'Booking successful',
            message: `Successfully booked slot at ${targetTime}`,
          });
        }
      }
    );
  }, LOAD_TIME);
}

/**
 * Starts the sniping process.
 * @param {number} targetTime - The target time for sniping.
 */
function startSniping(targetTime) {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async function (tabs) {
      var tab = tabs[0];

      reloadAndSnipe(tab, targetTime);

      if (refreshInterval) clearInterval(refreshInterval);

      refreshInterval = setInterval(async () => {
        reloadAndSnipe(tab, targetTime);
      }, RELOAD_TIME);
    }
  );
}

function stopSniping() {
  clearInterval(refreshInterval);
  refreshInterval = null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_SNIPING') {
    startSniping(request.payload.targetTime);
  } else if (request.type === 'STOP_SNIPING') {
    stopSniping();
  } else if (request.type === 'CHECK_SNIPING_STATUS') {
    sendResponse({
      payload: {
        isSniping: !!refreshInterval,
      },
    });
  }
});
