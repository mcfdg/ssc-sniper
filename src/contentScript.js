'use strict';

let isSniping = false;

/**
 * Attempts to open details window of a slot with the target time.
 * @param {string} targetTime - The target time to book.
 * @returns {boolean} Returns true if the slot was successfully booked, false otherwise.
 */
function attemptBooking(targetTime) {
  const bookableSlots = document.querySelectorAll(
    '[data-test-id="bookable-slot-list"]'
  );

  let success = false;

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
        success = true;
      } // Else, already booked or not available
    }
  });

  return success;
}

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request', request);
  if (request.type === 'ATTEMPT_BOOKING') {
    let success = attemptBooking(request.payload.targetTime);

    isSniping = true;

    sendResponse({
      payload: {
        success: success,
      },
    });
    return true;
  } else if (request.type === 'GET_FULL_SLOTS') {
    console.log('GET_FULL_SLOTS');
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
  }

  sendResponse({});
  return true;
});

// Attempt to book every second. Any details window that can be booked will be booked.
setInterval(() => {
  if (!isSniping) return;

  const bookButton = document.querySelector(
    '[data-test-id="details-book-button"]'
  );

  if (bookButton) {
    bookButton.click();
    isSniping = false;
  }
}, 1000);
