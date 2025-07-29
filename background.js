// Background script for LinkedIn Profile Scraper
console.log('LinkedIn Profile Scraper background script loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);
    
    // Set default settings
    chrome.storage.local.set({
        apiUrl: 'http://localhost:3000/api',
        delay: 3000,
        maxRetries: 3
    });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    if (request.action === 'createTab') {
        chrome.tabs.create({
            url: request.url,
            active: false
        }, (tab) => {
            sendResponse({ tabId: tab.id });
        });
        return true; // Will respond asynchronously
    }
    
    if (request.action === 'closeTab') {
        chrome.tabs.remove(request.tabId, () => {
            sendResponse({ success: true });
        });
        return true; // Will respond asynchronously
    }
    
    if (request.action === 'getActiveTab') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            sendResponse({ tab: tabs[0] });
        });
        return true; // Will respond asynchronously
    }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('linkedin.com/in/')) {
        console.log('LinkedIn profile tab loaded:', tab.url);
        
        // Inject content script if not already injected
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch((error) => {
            console.log('Content script already injected or failed to inject:', error);
        });
    }
});

// Error handling for runtime errors
chrome.runtime.onSuspend.addListener(() => {
    console.log('Background script suspending...');
});

// Keep service worker alive
const keepAlive = () => {
    setTimeout(keepAlive, 20000); // 20 seconds
};
keepAlive();