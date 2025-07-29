console.log('LinkedIn Profile Scraper content script loaded');

// Main message handler
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'scrapeProfile') {
    console.log('Scraping profile data from:', window.location.href);
    
    // Process in background with proper error handling
    setTimeout(() => {
      autoScroll().then(() => {
        try {
          const profileData = extractProfileData();
          console.log('Extracted profile data:', profileData);
          
          if (profileData && profileData.name) {
            sendResponse(profileData);
          } else {
            console.error('Failed to extract valid profile data');
            sendResponse(null);
          }
        } catch (error) {
          console.error('Error during profile extraction:', error);
          sendResponse(null);
        }
      }).catch(error => {
        console.error('Auto-scroll failed:', error);
        // Try to extract data anyway
        try {
          const profileData = extractProfileData();
          sendResponse(profileData);
        } catch (extractError) {
          console.error('Fallback extraction failed:', extractError);
          sendResponse(null);
        }
      });
    }, 2000);
    
    return true; // Keep message channel open for async response
  }
});

// Improved data extraction with multiple fallback selectors
function extractProfileData() {
  try {
    console.log('Starting profile data extraction...');

    // Helper function to get text from first matching selector
    const getText = (selectors, description = '') => {
      for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        try {
          const elements = document.querySelectorAll(selector);
          for (let element of elements) {
            if (element && element.textContent && element.textContent.trim()) {
              const text = element.textContent.trim();
              console.log(`Found ${description} using selector ${i + 1}: "${text}"`);
              return text;
            }
          }
        } catch (selectorError) {
          console.warn(`Selector error for ${description}:`, selector, selectorError);
        }
      }
      console.warn(`No ${description} found with any selector`);
      return '';
    };

    // Extract name with multiple selectors
    const nameSelectors = [
      'h1.text-heading-xlarge',
      'h1.top-card-layout__title',
      '.pv-text-details__left-panel h1',
      '.ph5 h1',
      'h1[data-generated-suggestion-target]',
      '.pv-top-card--list li:first-child h1',
      '.text-heading-xlarge.inline.t-24.v-align-middle.break-words',
      '.artdeco-entity-lockup__title'
    ];
    
    const name = getText(nameSelectors, 'name');
    
    // Extract bio/headline
    const bioSelectors = [
      '.text-body-medium.break-words',
      '.top-card-layout__headline',
      '.pv-text-details__left-panel .text-body-medium',
      '.ph5 .text-body-medium',
      '.pv-top-card--list .text-body-medium',
      '.pv-entity__summary-info .pv-entity__summary-info-content',
      '.text-body-medium.t-black.break-words',
      '.artdeco-entity-lockup__subtitle'
    ];
    
    const bio = getText(bioSelectors, 'bio');
    
    // Extract location
    const locationSelectors = [
      '.text-body-small.inline.t-black--light.break-words',
      '.top-card-layout__first-subline .text-body-small',
      '.pv-text-details__left-panel .text-body-small',
      '.ph5 .text-body-small',
      '.pv-top-card--list .pv-top-card--list-bullet li',
      '.pv-entity__summary-info .pv-entity__summary-info-content',
      '.text-body-small.inline.t-black--light',
      '.artdeco-entity-lockup__caption'
    ];
    
    let location = getText(locationSelectors, 'location');
    
    // Clean location (remove connection info if present)
    if (location.includes('•')) {
      location = location.split('•')[0].trim();
    }
    if (location.includes('connection')) {
      location = location.replace(/\d+.*connection.*$/i, '').trim();
    }
    
    // Extract about section
    const aboutSelectors = [
      '#about + * .pv-shared-text-with-see-more .inline-show-more-text__text',
      '.pv-about-section .pv-about__summary-text .inline-show-more-text__text',
      '[data-generated-suggestion-target="urn:li:member"] .inline-show-more-text__text',
      '.pv-about__summary-text',
      '#about ~ * .inline-show-more-text__text',
      '.pv-shared-text-with-see-more .inline-show-more-text__text',
      '.pv-about-section .pv-shared-text-with-see-more__text',
      '.about-section .inline-show-more-text__text'
    ];
    
    let about = getText(aboutSelectors, 'about');
    
    // Fallback: try to find about section by looking for specific patterns
    if (!about) {
      try {
        const aboutSection = document.querySelector('[data-section="about"]') || 
                           document.querySelector('section[data-section="about"]') ||
                           document.querySelector('section:has(#about)');
        
        if (aboutSection) {
          const aboutText = aboutSection.querySelector('.inline-show-more-text__text, .pv-shared-text-with-see-more__text, .full-width');
          if (aboutText) {
            about = aboutText.textContent.trim();
            console.log('Found about using fallback method');
          }
        }
      } catch (aboutError) {
        console.warn('About fallback failed:', aboutError);
      }
    }
    
    // Extract connection count
    const connectionSelectors = [
      'a[href*="connections"] span.t-bold',
      'a[href*="overlay/connections"] span',
      '.pv-top-card--list-bullet li:contains("connections")',
      '.pvs-header__optional-link--connections span',
      '.top-card-layout__first-subline .t-bold'
    ];
    
    let connectionCount = getText(connectionSelectors, 'connections');
    
    // Fallback for connections
    if (!connectionCount) {
      try {
        const connectionLinks = document.querySelectorAll('a[href*="connections"], a[href*="overlay/connections"]');
        for (const link of connectionLinks) {
          const text = link.textContent.trim();
          if (text.toLowerCase().includes('connection')) {
            connectionCount = text;
            console.log('Found connections using fallback method:', text);
            break;
          }
        }
      } catch (connError) {
        console.warn('Connection fallback failed:', connError);
      }
    }
    
    // Extract follower count
    const followerSelectors = [
      'a[href*="followers"] span.t-bold',
      'a[href*="followers"] span',
      '.pv-top-card--list-bullet li:contains("followers")',
      '.pvs-header__optional-link--followers span',
      '.top-card-layout__first-subline .t-bold'
    ];
    
    let followerCount = getText(followerSelectors, 'followers');
    
    // Fallback for followers
    if (!followerCount) {
      try {
        const followerLinks = document.querySelectorAll('a[href*="followers"]');
        for (const link of followerLinks) {
          const text = link.textContent.trim();
          if (text.toLowerCase().includes('follower')) {
            followerCount = text;
            console.log('Found followers using fallback method:', text);
            break;
          }
        }
      } catch (followerError) {
        console.warn('Follower fallback failed:', followerError);
      }
    }

    // Clean and validate extracted data
    const profileData = {
      name: cleanText(name),
      url: window.location.href,
      bio: cleanText(bio),
      about: cleanText(about),
      location: cleanText(location),
      connectionCount: cleanText(connectionCount),
      followerCount: cleanText(followerCount),
      timestamp: new Date().toISOString(),
      scrapedFrom: 'LinkedIn Profile'
    };

    console.log('Final extracted profile data:', profileData);

    // Validate that we have at least name
    if (!profileData.name) {
      console.error('Critical: No name found - scraping failed');
      
      // Last resort: try to find any h1 element
      const anyH1 = document.querySelector('h1');
      if (anyH1 && anyH1.textContent.trim()) {
        profileData.name = cleanText(anyH1.textContent);
        console.log('Used fallback h1 for name:', profileData.name);
      } else {
        profileData.name = 'Unknown Profile';
        console.warn('Using default name: Unknown Profile');
      }
    }

    return profileData;

  } catch (error) {
    console.error('Critical error in extractProfileData:', error);
    
    // Return minimal data to prevent complete failure
    return {
      name: 'Extraction Failed',
      url: window.location.href,
      bio: '',
      about: '',
      location: '',
      connectionCount: '',
      followerCount: '',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

// Clean text function
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')         // Replace multiple spaces with single space
    .replace(/\n+/g, ' ')         // Replace newlines with space
    .replace(/\t+/g, ' ')         // Replace tabs with space
    .trim()                       // Remove leading/trailing whitespace
    .substring(0, 2000);          // Limit length to prevent issues
}

// Auto-scroll implementation with better error handling
function autoScroll() {
  return new Promise((resolve) => {
    console.log('Starting auto-scroll...');
    
    let scrollPosition = 0;
    const scrollStep = 300;
    let scrollAttempts = 0;
    const maxScrollAttempts = 20;
    
    const scrollInterval = setInterval(() => {
      const beforeScroll = window.pageYOffset;
      window.scrollBy(0, scrollStep);
      const afterScroll = window.pageYOffset;
      
      scrollPosition = afterScroll;
      scrollAttempts++;
      
      console.log(`Scroll attempt ${scrollAttempts}: ${beforeScroll} -> ${afterScroll}`);
      
      // Stop if we've reached the bottom or hit max attempts
      if (beforeScroll === afterScroll || 
          scrollPosition >= document.body.scrollHeight - window.innerHeight ||
          scrollAttempts >= maxScrollAttempts) {
        clearInterval(scrollInterval);
        console.log('Auto-scroll completed');
        
        // Wait a bit for any lazy-loaded content
        setTimeout(() => {
          resolve();
        }, 1000);
      }
    }, 200);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(scrollInterval);
      console.log('Auto-scroll timeout reached');
      resolve();
    }, 10000);
  });
}

// Initialize auto-scroll when page loads
function initializeAutoScroll() {
  if (document.readyState === 'complete') {
    setTimeout(autoScroll, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(autoScroll, 1000);
    });
  }
}

// Start auto-scroll
initializeAutoScroll();

// Add debugging info
console.log('Content script ready. Page URL:', window.location.href);
console.log('Page ready state:', document.readyState);