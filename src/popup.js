'use strict';

import './popup.css';

(function () {
  // check if current tab is from https://dms.studentensportcentrumeindhoven.nl/*

  let isSniping = false;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    if (
      !url.startsWith(
        'https://dms.studentensportcentrumeindhoven.nl/products/bookable-product-schedule'
      )
    ) {
      const parent = document.getElementsByClassName('app')[0];
      const message = document.createElement('button');
      message.classList.add('wrong-page-button');
      message.textContent = 'Open booking page';
      message.onclick = () => {
        chrome.tabs.create({
          url: 'https://dms.studentensportcentrumeindhoven.nl/products/bookable-product-schedule',
        });
      };
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

  chrome.runtime.sendMessage(
    {
      type: 'CHECK_SNIPING_STATUS',
    },
    (response) => {
      console.log('response', response.payload.isSniping);
      isSniping = response.payload.isSniping;
      if (isSniping) {
        document.getElementById('stopBtn').removeAttribute('disabled');
      }
    }
  );

  document.getElementById('submitBtn').addEventListener('click', () => {
    const targetTime = document.getElementById('targetTime').value;

    isSniping = true;

    document.getElementById('stopBtn').removeAttribute('disabled');

    chrome.runtime.sendMessage({
      type: 'START_SNIPING',
      payload: {
        targetTime,
      },
    });
  });

  document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'STOP_SNIPING',
    });

    document.getElementById('stopBtn').setAttribute('disabled', 'disabled');
  });
})();
