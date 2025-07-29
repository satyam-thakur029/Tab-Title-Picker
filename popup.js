// Enhanced popup.js with better error handling and debugging

document.addEventListener('DOMContentLoaded', function() {
   initializeTabNavigation();
  initializeLinkedInScraper();
   initializeTabTitlePicker();
});
// Tab Navigation
function initializeTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      btn.classList.add('active');
      document.getElementById(targetTab + '-tab').classList.add('active');
    });
  });
}
function initializeTabTitlePicker() {
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

  // Only add event listeners if the elements exist (for the tab picker tab)
  if (getTitleBtn) {
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
      const container = document.querySelector('.container');
      if (container) {
        container.style.opacity = '1';
      }
    }, 100);
  }
}

async function initializeLinkedInScraper() {
  const DEFAULT_URLS = [
   
    'https://www.linkedin.com/in/sundarpichai/',
    'https://www.linkedin.com/in/jeffweiner08/',
    'https://www.linkedin.com/in/williamhgates/'
  ];

  const API_BASE_URL = 'http://localhost:3000';
  console.log('API Base URL:', API_BASE_URL);

  // DOM elements
  const urlInput = document.getElementById('urlInput');
  const addUrlBtn = document.getElementById('addUrlBtn');
  const urlList = document.getElementById('urlList');
  const scrapeBtn = document.getElementById('scrapeBtn');
  const viewDataBtn = document.getElementById('viewDataBtn');
  const statusMessage = document.getElementById('statusMessage');
  const progressSection = document.getElementById('progressSection');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const apiIndicator = document.getElementById('apiIndicator');
  const apiStatusText = document.getElementById('apiStatusText');
  const profileCount = document.getElementById('profileCount');
  const dataSection = document.getElementById('dataSection');
  const dataList = document.getElementById('dataList');
  const searchInput = document.getElementById('searchInput');
  const refreshBtn = document.getElementById('refreshBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  let profileUrls = [];
  let isProcessing = false;
  let allProfiles = [];

  // Initialize
  try {
    await loadStoredUrls();
    await checkApiStatus();
    setupEventListeners();

    if (profileUrls.length === 0) {
      profileUrls = [...DEFAULT_URLS];
      await saveUrls();
      renderUrlList();
    }

    // Show container with animation
    setTimeout(() => {
      document.querySelector('.container').style.opacity = '1';
    }, 100);

  } catch (error) {
    console.error('Initialization error:', error);
    showScraperStatus('Failed to initialize extension', 'error');
  }

  function setupEventListeners() {
    addUrlBtn.addEventListener('click', addUrl);
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addUrl();
    });
    scrapeBtn.addEventListener('click', startScraping);
    viewDataBtn.addEventListener('click', toggleDataView);
    refreshBtn.addEventListener('click', loadProfiles);
    clearAllBtn.addEventListener('click', clearAllData);
    searchInput.addEventListener('input', filterProfiles);
    setInterval(checkApiStatus, 30000);
  }

  // Enhanced scraping function with better error handling
  async function scrapeProfile(tabId, url) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error('Scraping timeout for tab:', tabId, 'URL:', url);
        resolve({ error: 'Timeout', url });
      }, 20000); // Increased timeout

      // First, check if tab exists
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          clearTimeout(timeout);
          console.error('Tab not found:', tabId, chrome.runtime.lastError?.message);
          resolve({ error: 'Tab not found', url });
          return;
        }

        // Wait for page to be completely loaded
        const checkPageLoad = (attempts = 0) => {
          if (attempts > 10) {
            clearTimeout(timeout);
            resolve({ error: 'Page load timeout', url });
            return;
          }

          chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError || !tab) {
              clearTimeout(timeout);
              resolve({ error: 'Tab lost during loading', url });
              return;
            }

            if (tab.status === 'complete') {
              // Page is loaded, now inject and execute content script
              executeContentScript(tabId, url, timeout, resolve);
            } else {
              // Wait and try again
              setTimeout(() => checkPageLoad(attempts + 1), 1000);
            }
          });
        };

        checkPageLoad();
      });
    });
  }

  function executeContentScript(tabId, url, timeout, resolve) {
    // Inject content script
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: linkedInContentScript // Define the content script as a function
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('Content script injection failed:', chrome.runtime.lastError.message);
        clearTimeout(timeout);
        resolve({ error: 'Content script injection failed', url });
        return;
      }

      // Wait a bit for the script to initialize
      setTimeout(() => {
        // Send message to content script
        chrome.tabs.sendMessage(tabId, { 
          action: 'scrapeProfile',
          url: url // Pass URL for context
        }, (response) => {
          clearTimeout(timeout);
          
          if (chrome.runtime.lastError) {
            console.error('Message error:', chrome.runtime.lastError.message);
            resolve({ error: 'Message error: ' + chrome.runtime.lastError.message, url });
          } else if (!response) {
            console.error('No response from content script for:', url);
            resolve({ error: 'No response from content script', url });
          } else if (response.error) {
            console.error('Content script error:', response.error);
            resolve({ error: response.error, url });
          } else {
            console.log('Successfully received profile data:', response);
            resolve(response);
          }
        });
      }, 3000); // Increased wait time
    });
  }

  // Enhanced content script function (to be injected)
  function linkedInContentScript() {
    console.log('LinkedIn content script loaded');

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'scrapeProfile') {
        console.log('Scraping profile for URL:', request.url);
        
        try {
          const profileData = extractProfileData();
          if (profileData.name) {
            console.log('Profile data extracted successfully:', profileData);
            sendResponse(profileData);
          } else {
            console.error('Failed to extract profile name');
            sendResponse({ error: 'Failed to extract profile name' });
          }
        } catch (error) {
          console.error('Error in profile extraction:', error);
          sendResponse({ error: error.message });
        }
      }
      return true; // Keep message channel open
    });

    function extractProfileData() {
      // Wait for content to load
      const waitForElement = (selector, timeout = 10000) => {
        return new Promise((resolve) => {
          const startTime = Date.now();
          const checkForElement = () => {
            const element = document.querySelector(selector);
            if (element) {
              resolve(element);
            } else if (Date.now() - startTime < timeout) {
              setTimeout(checkForElement, 500);
            } else {
              resolve(null);
            }
          };
          checkForElement();
        });
      };

      // Multiple selectors for name (LinkedIn changes these frequently)
      const nameSelectors = [
        'h1.text-heading-xlarge',
        'h1.inline.t-24.v-align-middle.break-words',
        '.pv-text-details__left-panel h1',
        '.ph5.pb5 h1',
        '[data-generated-suggestion-target] h1',
        '.pv-top-card--list h1'
      ];

      // Get name
      let name = '';
      for (const selector of nameSelectors) {
        const nameElement = document.querySelector(selector);
        if (nameElement && nameElement.textContent.trim()) {
          name = nameElement.textContent.trim();
          break;
        }
      }

      // If still no name, try more generic selectors
      if (!name) {
        const h1Elements = document.querySelectorAll('h1');
        for (const h1 of h1Elements) {
          const text = h1.textContent.trim();
          if (text && text.length > 2 && text.length < 100 && !text.includes('LinkedIn')) {
            name = text;
            break;
          }
        }
      }

      console.log('Extracted name:', name);

      // Bio/headline selectors
      const bioSelectors = [
        '.text-body-medium.break-words',
        '.pv-text-details__left-panel .text-body-medium',
        '.ph5.pb5 .text-body-medium',
        '.pv-top-card--list .text-body-medium'
      ];

      let bio = '';
      for (const selector of bioSelectors) {
        const bioElement = document.querySelector(selector);
        if (bioElement && bioElement.textContent.trim()) {
          bio = bioElement.textContent.trim();
          break;
        }
      }

      // About section
      const aboutSelectors = [
        '[data-generated-suggestion-target="about"] .full-width .inline-show-more-text span[aria-hidden="true"]',
        '.pv-about-section .full-width span[aria-hidden="true"]',
        '#about ~ * .inline-show-more-text span[aria-hidden="true"]'
      ];

      let about = '';
      for (const selector of aboutSelectors) {
        const aboutElement = document.querySelector(selector);
        if (aboutElement && aboutElement.textContent.trim()) {
          about = aboutElement.textContent.trim();
          break;
        }
      }

      // Location
      const locationSelectors = [
        '.text-body-small.inline.t-black--light.break-words',
        '.pv-text-details__left-panel .text-body-small',
        '.ph5.pb5 .text-body-small'
      ];

      let location = '';
      for (const selector of locationSelectors) {
        const locationElement = document.querySelector(selector);
        if (locationElement && locationElement.textContent.trim()) {
          location = locationElement.textContent.trim();
          break;
        }
      }

      // Connection count
      let connectionCount = '';
      const connectionElements = document.querySelectorAll('span');
      for (const span of connectionElements) {
        const text = span.textContent.trim();
        if (text.includes('connection') || text.includes('follower')) {
          connectionCount = text;
          break;
        }
      }

      const profileData = {
        name: name || 'Unknown',
        url: window.location.href,
        bio: bio || '',
        about: about || '',
        location: location || '',
        connectionCount: connectionCount || '',
        followerCount: '', // This is harder to get consistently
        timestamp: new Date().toISOString()
      };

      console.log('Final profile data:', profileData);
      return profileData;
    }
  }

  // Enhanced main scraping function
  async function startScraping() {
    if (isProcessing) return;

    if (profileUrls.length < 1) {
      showScraperStatus('Add at least 1 LinkedIn profile URL to start scraping', 'error');
      return;
    }

    isProcessing = true;
    scrapeBtn.disabled = true;
    scrapeBtn.querySelector('span').textContent = 'Processing...';
    scrapeBtn.querySelector('i').className = 'fas fa-spinner';
    progressSection.classList.remove('hidden');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      for (let i = 0; i < profileUrls.length; i++) {
        const url = profileUrls[i];
        const profileName = url.split('/').pop() || `Profile ${i + 1}`;
        
        updateProgress(i, profileUrls.length, `Opening ${profileName}...`);

        try {
          console.log(`Processing profile ${i + 1}/${profileUrls.length}: ${url}`);
          
          const tab = await createTab(url);
          console.log('Created tab:', tab.id);
          
          // Wait longer for page to load
          await delay(8000);

          updateProgress(i, profileUrls.length, `Scraping ${profileName}...`);

          const profileData = await scrapeProfile(tab.id, url);

          if (profileData && profileData.name && !profileData.error) {
            console.log('Profile data extracted:', profileData);
            
            try {
              const apiResult = await sendProfileToAPI(profileData);
              if (apiResult && apiResult.success) {
                successCount++;
                updateProgress(i + 1, profileUrls.length, `✅ Saved ${profileData.name}`);
                console.log(`Successfully saved profile: ${profileData.name}`);
              } else {
                errorCount++;
                const error = `API save failed for ${profileName}: ${apiResult?.message || 'Unknown error'}`;
                errors.push(error);
                console.error(error);
                updateProgress(i + 1, profileUrls.length, `❌ Save failed for ${profileName}`);
              }
            } catch (apiError) {
              errorCount++;
              const error = `API error for ${profileName}: ${apiError.message}`;
              errors.push(error);
              console.error('API error:', apiError);
              updateProgress(i + 1, profileUrls.length, `❌ API error for ${profileName}`);
            }
          } else {
            errorCount++;
            const error = profileData?.error || 'Failed to extract profile data';
            errors.push(`${profileName}: ${error}`);
            console.error('Failed to extract profile data from:', url, 'Error:', error);
            updateProgress(i + 1, profileUrls.length, `❌ ${error}`);
          }

          // Close the tab
          try {
            await chrome.tabs.remove(tab.id);
            console.log('Closed tab:', tab.id);
          } catch (closeError) {
            console.error('Error closing tab:', closeError);
          }

          // Wait between requests
          if (i < profileUrls.length - 1) {
            await delay(5000); // Increased delay
          }

        } catch (error) {
          errorCount++;
          const errorMsg = `Error processing ${profileName}: ${error.message}`;
          errors.push(errorMsg);
          console.error(errorMsg, error);
          updateProgress(i + 1, profileUrls.length, `❌ Error: ${profileName}`);
        }
      }

      // Final status with detailed error reporting
      updateProgress(profileUrls.length, profileUrls.length, '🎉 Scraping complete!');

      let statusMessage = '';
      if (successCount > 0) {
        statusMessage = `🎉 Successfully scraped ${successCount} profiles!`;
        if (errorCount > 0) {
          statusMessage += ` ⚠️ ${errorCount} failed.`;
        }
        showScraperStatus(statusMessage, 'success');
        await checkApiStatus(); // Refresh profile count
      } else {
        statusMessage = '❌ No profiles were successfully scraped.';
        showScraperStatus(statusMessage, 'error');
      }

      // Log detailed errors for debugging
      if (errors.length > 0) {
        console.error('Detailed scraping errors:');
        errors.forEach((error, index) => {
          console.error(`${index + 1}. ${error}`);
        });
      }

    } catch (error) {
      console.error('Scraping process failed:', error);
      showScraperStatus(`❌ Scraping failed: ${error.message}`, 'error');
    } finally {
      isProcessing = false;
      scrapeBtn.disabled = false;
      scrapeBtn.querySelector('span').textContent = 'Start Scraping';
      scrapeBtn.querySelector('i').className = 'fas fa-play';

      // Hide progress section after delay
      setTimeout(() => {
        progressSection.classList.add('hidden');
      }, 5000);
    }
  }

  // Utility functions (rest of your existing code remains the same)
  async function addUrl() {
    const url = urlInput.value.trim();
    if (!url) return;

    if (!isValidLinkedInUrl(url)) {
      showScraperStatus('Please enter a valid LinkedIn profile URL', 'error');
      return;
    }

    if (profileUrls.includes(url)) {
      showScraperStatus('URL already added', 'error');
      return;
    }

    profileUrls.push(url);
    urlInput.value = '';
    await saveUrls();
    renderUrlList();
    showScraperStatus('URL added successfully', 'success');
  }

  function removeUrl(index) {
    profileUrls.splice(index, 1);
    saveUrls();
    renderUrlList();
    showScraperStatus('URL removed', 'info');
  }

  window.removeUrl = removeUrl;

  function isValidLinkedInUrl(url) {
    const linkedinPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/;
    return linkedinPattern.test(url);
  }

  async function saveUrls() {
    return new Promise((resolve) => {
      chrome.storage.local.set({ profileUrls }, resolve);
    });
  }

  async function loadStoredUrls() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['profileUrls'], (result) => {
        profileUrls = result.profileUrls || [];
        renderUrlList();
        resolve();
      });
    });
  }

  function renderUrlList() {
    urlList.innerHTML = '';
    if (profileUrls.length === 0) {
      urlList.innerHTML = '<div class="empty-state"><p>No URLs added yet</p></div>';
      return;
    }

    profileUrls.forEach((url, index) => {
      const urlItem = document.createElement('div');
      urlItem.className = 'url-item';
      urlItem.innerHTML = `
        <span class="url-text">${url.replace('https://www.linkedin.com/in/', '').replace('/', '')}</span>
        <button class="remove-btn" data-index="${index}">×</button>
      `;
      urlList.appendChild(urlItem);
    });

    urlList.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        removeUrl(idx);
      });
    });
  }

  function showScraperStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.classList.remove('hidden');

    setTimeout(() => {
      statusMessage.classList.add('hidden');
    }, 4000);
  }

  function updateProgress(current, total, message = '') {
    const percentage = (current / total) * 100;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = message || `Processing ${current}/${total} profiles...`;
  }

  async function checkApiStatus() {
    try {
      console.log('Checking API status...');
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API health response:', data);

      if (data.status === 'OK') {
        apiIndicator.className = 'api-indicator online';
        apiStatusText.textContent = 'API Online';

        const profilesResponse = await fetch(`${API_BASE_URL}/api/profiles`);
        if (profilesResponse.ok) {
          const profilesData = await profilesResponse.json();
          profileCount.textContent = `${profilesData.count || 0} profiles`;
          
          if (profilesData.count > 0) {
            viewDataBtn.style.display = 'flex';
          }
        } else {
          profileCount.textContent = '0 profiles';
        }
      } else {
        throw new Error('API not responding properly');
      }
    } catch (err) {
      console.error('API connection failed:', err);
      apiIndicator.className = 'api-indicator offline';
      apiStatusText.textContent = 'API Offline';
      profileCount.textContent = 'No connection';
      viewDataBtn.style.display = 'none';
    }
  }

  async function sendProfileToAPI(profileData) {
    const payload = {
      name: profileData.name || 'Unknown',
      url: profileData.url || '',
      about: profileData.about || '',
      bio: profileData.bio || '',
      location: profileData.location || '',
      followerCount: profileData.followerCount || '',
      connectionCount: profileData.connectionCount || ''
    };

    console.log('Sending payload to API:', payload);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API result:', result);
      return result;
    } catch (error) {
      console.error('Error sending profile to API:', error);
      throw error;
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function createTab(url) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url, active: false }, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(tab);
        }
      });
    });
  }

  // Additional functions for data viewing would go here...
  async function toggleDataView() {
    if (dataSection.classList.contains('hidden')) {
      await loadProfiles();
      dataSection.classList.remove('hidden');
      dataSection.classList.add('fade-in');
      viewDataBtn.innerHTML = '<i class="fas fa-eye-slash"></i><span>Hide Data</span>';
    } else {
      dataSection.classList.add('hidden');
      viewDataBtn.innerHTML = '<i class="fas fa-database"></i><span>View Data</span>';
    }
  }

  async function loadProfiles() {
    try {
      viewDataBtn.classList.add('loading');
      const response = await fetch(`${API_BASE_URL}/api/profiles`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      allProfiles = data.data || [];
      renderProfileList(allProfiles);
      
    } catch (error) {
      console.error('Error loading profiles:', error);
      showScraperStatus('Failed to load profiles', 'error');
      dataList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load profiles</p></div>';
    } finally {
      viewDataBtn.classList.remove('loading');
    }
  }

  function renderProfileList(profiles) {
    if (!profiles || profiles.length === 0) {
      dataList.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No profiles found</p></div>';
      return;
    }

    dataList.innerHTML = '';
    profiles.forEach(profile => {
      const profileItem = document.createElement('div');
      profileItem.className = 'profile-item';
      
      const createdDate = new Date(profile.createdAt).toLocaleDateString();
      const bio = profile.bio || 'No bio available';
      const location = profile.location || 'Location not specified';
      const connections = profile.connectionCount || 'N/A';
      
      profileItem.innerHTML = `
        <div class="profile-header">
          <h4 class="profile-name">${profile.name}</h4>
          <span class="profile-date">${createdDate}</span>
        </div>
        <div class="profile-bio">${bio}</div>
        <div class="profile-details">
          <div class="profile-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${location}</span>
          </div>
          <div class="profile-connections">
            <i class="fas fa-users"></i>
            <span>${connections}</span>
          </div>
        </div>
      `;

      profileItem.addEventListener('click', () => {
        chrome.tabs.create({ url: profile.url });
      });

      profileItem.style.cursor = 'pointer';
      profileItem.title = 'Click to open LinkedIn profile';

      dataList.appendChild(profileItem);
    });
  }

  function filterProfiles() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
      renderProfileList(allProfiles);
      return;
    }

    const filteredProfiles = allProfiles.filter(profile => 
      profile.name.toLowerCase().includes(searchTerm) ||
      (profile.bio && profile.bio.toLowerCase().includes(searchTerm)) ||
      (profile.location && profile.location.toLowerCase().includes(searchTerm)) ||
      (profile.about && profile.about.toLowerCase().includes(searchTerm))
    );

    renderProfileList(filteredProfiles);
  }

  async function clearAllData() {
    if (!confirm('Are you sure you want to delete all scraped profiles? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles`);
      const data = await response.json();
      const profileIds = data.data.map(p => p.id);

      if (profileIds.length === 0) {
        showScraperStatus('No profiles to delete', 'info');
        return;
      }

      const deleteResponse = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: profileIds })
      });

      if (deleteResponse.ok) {
        allProfiles = [];
        renderProfileList([]);
        await checkApiStatus();
        showScraperStatus('All profiles deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete profiles');
      }

    } catch (error) {
      console.error('Error deleting profiles:', error);
      showScraperStatus('Failed to delete profiles', 'error');
    }
  }
}