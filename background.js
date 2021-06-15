
chrome.runtime.onInstalled.addListener((details)=>{
    console.log("The extension has been installed!");

    var speech_to_text_Lichess_fuzzy_words = {
        "night": "knight",
        "knights": "knight",
        "brooke": "rook",
        "kapture": "capture",
        "clean": "queen",
        "echosex": "echo six",
        "won": "1",

        "to": "2",
        "too": "2",
        "ii": "2",
        
        "iii": "3",

        "for": "4",
        "force": "4",
        "ford": "4",
        "iv": "4",
    
        "v": "5",
    
        "sticks": "6",
        "stix": "6",
        "sex": "6",
        "vi": "6",

        "vii": "7",
        "hate": "8",
        "ate": "8",
        "viii": "8"
            
    };

    chrome.storage.local.set(speech_to_text_Lichess_fuzzy_words);
    
});
