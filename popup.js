document.addEventListener('DOMContentLoaded', function() {
  const getTitleBtn = document.getElementById('getTitleBtn');
  const tabTitleDiv = document.getElementById('tabTitle');
  const titleText = document.getElementById('titleText');
  const copyBtn = document.getElementById('copyBtn');
  const statusIndicator = document.getElementById('statusIndicator');
  const btnText = getTitleBtn.querySelector('span');
  const btnIcon = getTitleBtn.querySelector('i');

  function updateStatus(status, text) {
    const statusIcon = statusIndicator.querySelector('i');
    const statusText = statusIndicator.querySelector('span');
    
    statusIndicator.className = `status-indicator ${status}`;
    statusText.textContent = text;
    
    if (status === 'loading') {
      statusIcon.className = 'fas fa-spinner';
    } else if (status === 'success') {
      statusIcon.className = 'fas fa-circle';
    } else if (status === 'error') {
      statusIcon.className = 'fas fa-circle';
    } else {
      statusIcon.className = 'fas fa-circle';
    }
  }

  function animateButton(state, text, icon) {
    getTitleBtn.className = `get-title-btn ${state}`;
    btnText.textContent = text;
    btnIcon.className = icon;
  }

  getTitleBtn.addEventListener('click', function() {
    // Show loading state
    animateButton('loading', 'Getting Title...', 'fas fa-spinner');
    updateStatus('loading', 'Retrieving...');
    
    // Query the current active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      setTimeout(() => { // Add small delay for better UX
        if (tabs.length > 0) {
          const currentTab = tabs[0];
          const tabTitle = currentTab.title || 'Untitled Tab';
          
          // Display the title
          titleText.textContent = tabTitle;
          tabTitleDiv.classList.add('show');
          
          // Show success state
          animateButton('success', 'Title Retrieved!', 'fas fa-check');
          updateStatus('success', 'Success');
          
          // Reset button after 2.5 seconds
          setTimeout(function() {
            animateButton('', 'Get Current Tab Title', 'fas fa-magic');
            updateStatus('', 'Ready');
          }, 2500);
          
        } else {
          titleText.textContent = 'Could not retrieve tab title';
          tabTitleDiv.classList.add('show');
          
          // Show error state
          animateButton('', 'Try Again', 'fas fa-exclamation-triangle');
          updateStatus('error', 'Error');
          
          setTimeout(function() {
            animateButton('', 'Get Current Tab Title', 'fas fa-magic');
            updateStatus('', 'Ready');
          }, 3000);
        }
      }, 500);
    });
  });

  // Copy functionality
  copyBtn.addEventListener('click', async function() {
    try {
      await navigator.clipboard.writeText(titleText.textContent);
      
      // Show copy success
      const originalIcon = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      copyBtn.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
      
      updateStatus('success', 'Copied!');
      
      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        updateStatus('', 'Ready');
      }, 1500);
      
    } catch (err) {
      console.error('Failed to copy text: ', err);
      updateStatus('error', 'Copy failed');
      
      setTimeout(() => {
        updateStatus('', 'Ready');
      }, 2000);
    }
  });

  // Add entrance animation
  setTimeout(() => {
    document.querySelector('.container').style.opacity = '1';
  }, 100);
});