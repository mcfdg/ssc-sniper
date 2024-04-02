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
    let targetTime = document.getElementById('dropdown').value;

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

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'GET_FULL_SLOTS' },
      (response) => {
        const fullSlots = response.payload.fullSlots;
        console.log('fullSlots', fullSlots);

        // get element with id listContainer
        const listContainer = document.getElementById('listContainer');

        // create dropdown list with full slots
        const dropdown = document.createElement('select');
        dropdown.id = 'dropdown';
        dropdown.classList.add('dropdown');

        fullSlots.forEach((slot) => {
          const option = document.createElement('option');
          option.value = slot.time;
          option.textContent = slot.time + ' ' + slot.name;
          dropdown.appendChild(option);
        });

        listContainer.appendChild(dropdown);
      }
    );
  });
})();
