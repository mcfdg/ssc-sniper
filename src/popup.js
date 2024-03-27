'use strict';

import './popup.css';

(function () {
  // check if current tab is from https://dms.studentensportcentrumeindhoven.nl/*
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    if (
      !url.startsWith(
        'https://dms.studentensportcentrumeindhoven.nl/products/bookable-product-schedule'
      )
    ) {
      const parent = document.getElementsByClassName('app')[0];
      const message = document.createElement('p');
      message.classList.add('wrong-page-message');
      message.textContent = 'Open the booking page first.';
      parent.innerHTML = '';
      parent.appendChild(message);
      return;
    }
  });

  // if targetTime input changes and is valid, enable submit button
  document.getElementById('targetTime').addEventListener('input', () => {
    const targetTime = document.getElementById('targetTime').value;

    console.log(targetTime);

    if (/^\d{2}:\d{2}$/.test(targetTime)) {
      document.getElementById('submitBtn').removeAttribute('disabled');
    } else {
      document.getElementById('submitBtn').setAttribute('disabled', 'disabled');
    }
  });

  document.getElementById('submitBtn').addEventListener('click', () => {
    const targetTime = document.getElementById('targetTime').value;

    chrome.runtime.sendMessage({
      type: 'START_SNIPING',
      payload: {
        targetTime,
      },
    });
  });
})();
