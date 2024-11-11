'use strict';

let isSniping = false;
let targetTime;
let attemptedBooking = false;
let booked = false;

function attemptBooking() {
  attemptedBooking = true;
  const bookableSlots = document.querySelectorAll(
    '[data-test-id="bookable-slot-list"]'
  );

  // Loop through all bookable slots and attempt to open the details window of the slot with the target time
  bookableSlots.forEach((slot) => {
    const startTime = slot.querySelector(
      '[data-test-id="bookable-slot-start-time"] strong'
    ).textContent;

    if (startTime === targetTime) {
      const button = slot.querySelector(
        '[data-test-id="bookable-slot-book-button"]'
      );

      if (button) {
        // Opens the details window
        button.click();
        chrome.runtime.sendMessage({ type: 'SUCCESFULLY_BOOKED' });
        success = true;
      } else {
        // Already booked or not available
        reload();
        console.log('Already booked or not available');
      }
    }
  });
}

function reload() {
  location.reload();
}

// send message to ask if sniping is true
chrome.runtime.sendMessage({ type: 'IS_SNIPING' }, (response) => {
  isSniping = response.payload.isSniping;
  targetTime = response.payload.targetTime;
});

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_FULL_SLOTS') {
    const bookableSlots = document.querySelectorAll(
      '[data-test-id="bookable-slot-list"]'
    );

    const fullSlots = [];

    // Loop through all bookable slots and attempt to open the details window of the slot with the target time
    bookableSlots.forEach((slot) => {
      const fullSlot = {};

      const startTime = slot.querySelector(
        '[data-test-id="bookable-slot-start-time"] strong'
      ).textContent;

      fullSlot.time = startTime;

      const name = slot.querySelector(
        '[data-test-id="bookable-slot-linked-product-description"]'
      ).textContent;

      fullSlot.name = name;

      fullSlots.push(fullSlot);
    });

    sendResponse({
      payload: {
        fullSlots: fullSlots,
      },
    });
    return true;
  } else if (request.type === 'START_SNIPING') {
    isSniping = true;
    targetTime = request.payload.targetTime;
    console.log('targetTime', targetTime);
    reload();
    sendResponse({});
    return true;
  }

  sendResponse({});
  return true;
});

if (isSniping) {
  const bookableSlotListLoaded1 = document.querySelector(
    '[data-test-id="bookable-slot-list"]'
  );

  if (bookableSlotListLoaded1) {
    attemptBooking();
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!booked) {
      const bookButton = document.querySelector(
        '[data-test-id="details-book-button"]'
      );

      if (bookButton) {
        bookButton.click();
        isSniping = false;
        booked = true;
      }
    }

    if (!attemptedBooking && isSniping) {
      const bookableSlotListLoaded2 = document.querySelector(
        '[data-test-id="bookable-slot-list"]'
      );

      if (bookableSlotListLoaded2) {
        attemptBooking();
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
