package groq

import "testing"

func TestParseEnhancementValidatesStructuredResponse(t *testing.T) {
	enhancement, err := parseEnhancement(`{
		"recommendation": "Use the selected plan because it covers the deterministic target.",
		"connectivityGuide": {
			"beforeDeparture": [" Install the app. "],
			"airportSetup": ["Activate after landing."],
			"offlineStrategy": ["Save maps offline."],
			"backupInternet": ["Keep hotel Wi-Fi details handy."],
			"emergencyAccess": ["Leave primary SIM available for emergency calls."]
		}
	}`)
	if err != nil {
		t.Fatalf("parseEnhancement returned error: %v", err)
	}
	if enhancement.Recommendation == "" {
		t.Fatal("expected recommendation")
	}
	if enhancement.ConnectivityGuide.BeforeDeparture[0] != "Install the app." {
		t.Fatalf("expected trimmed guide item, got %q", enhancement.ConnectivityGuide.BeforeDeparture[0])
	}
}

func TestParseEnhancementRejectsIncompleteResponse(t *testing.T) {
	_, err := parseEnhancement(`{
		"recommendation": "Looks good.",
		"connectivityGuide": {
			"beforeDeparture": ["Install the app."]
		}
	}`)
	if err == nil {
		t.Fatal("expected parseEnhancement to reject incomplete guide")
	}
}
