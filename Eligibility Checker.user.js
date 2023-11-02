// ==UserScript==
// @name         Eligibility Checker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Check house eligibility for funding
// @author       MIchael Young
// @match        https://www.eeca.govt.nz/co-funding/insulation-and-heater-grants/warmer-kiwi-homes-programme/check-eligibility/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=govt.nz
// @grant        none
// ==/UserScript==

// NOTES
// Double addresses
// Internal server error occurred

// TO DO
// 40A Starforth Place, Henderson, Waitakere, Auckland (Already insulated)
// Test max addresses

(function() {
    'use strict';
    let eligibleAddresses = [];
    let ineligibleAddresses = [];
    let addresses = [];
    let numAddresses = -1;
    const mainElement = document.querySelector("li.ng-star-inserted");
    // Create the necessary elements
    const divElement = document.createElement("div");
    const paragraphElement = document.createElement("p");
    const inputElement = document.createElement("input");
    const submitAddressesButton = document.createElement("button");

    // Set attributes and text content for the elements (if desired)
    paragraphElement.textContent = "Please paste the desired addresses for searching and click the search button when ready";
    paragraphElement.style.color = "red";
    inputElement.setAttribute("type", "text");
    inputElement.style.border = "1px solid black";
    inputElement.style.padding = "2px";
    inputElement.style.margin = "2px";
    inputElement.setAttribute("placeholder", " Enter text here...   ");
    submitAddressesButton.type = "submit";
    submitAddressesButton.textContent = " Submit ";
    submitAddressesButton.style.display = "block"; // Make the button a block-level element
    submitAddressesButton.style.border = "1px grey";
    submitAddressesButton.style.padding = "2px";
    submitAddressesButton.style.margin = "2px";
    submitAddressesButton.style.color = "white"; // Set the text color to white
    submitAddressesButton.style.backgroundColor = "grey";
    // Append the elements to the div
    divElement.appendChild(paragraphElement);
    divElement.appendChild(inputElement);
    divElement.appendChild(submitAddressesButton);
    // Append the div to the document body (or any other parent element)
    mainElement.appendChild(divElement);

    submitAddressesButton.addEventListener("click", () => {
        if(inputElement.value === "") {
            console.log("Text box empty");
        } else {
            addresses = inputElement.value.split("-n-");
            console.log(addresses);
            numAddresses = addresses.length;
            console.log(numAddresses);
            startSearchProgram(addresses, numAddresses, eligibleAddresses, ineligibleAddresses);
        }
    });
})();

function startSearchProgram(addresses, numAddresses, eligibleAddresses, ineligibleAddresses) {
    let checkEligibilityButton = document.getElementsByClassName("btn btn-primary");
    checkEligibilityButton[0].click();
    document.getElementById("lbl-rad-oo-yes").click();
    document.getElementById("lbl-rad-built-yes").click();
    document.getElementById("lbl-rad-card-no").click();

    let currentIndex = 0;
    //const numAddresses = addresses.length;

    // ["353 Blockhouse Bay Road, Blockhouse Bay, Auckland"];
    //, "14 Watson Place, Papatoetoe, Auckland"
    let addressSearchBox = document.getElementById("address-search");

    // Get the <ul> element
    const ulElement = document.getElementsByClassName("form-address-options")[0];

    // Create a new MutationObserver instance
        const dropdownObserver = new MutationObserver(function (mutationsList, dropdownObserver) {
            // Check if the UL element contains LI elements
            const liElements = ulElement.querySelectorAll('li');
            if (liElements.length > 0) {
                // Disconnect the observer as the condition is met
                dropdownObserver.disconnect();
                // Execute the desired function
                searchForAddressOnDropdownLoad(ulElement);
            }
        });

    // Finding the address loading element.
    let checkingAddressElement = document.getElementsByTagName('p');
    let targetParagraph = null;
    for (let i = 0; i < checkingAddressElement.length; i++) {
        const paragraph = checkingAddressElement[i];
        if (paragraph.textContent.includes('Checking to see if you qualify...')) {
            checkingAddressElement = paragraph;
            break;
        }
    }

    const outerContinueButtonContainer = document.getElementsByClassName("btn-set-form page-width-small ng-tns-c53-0 ng-star-inserted")[0];
    const innerContinueButtonContainer = outerContinueButtonContainer.querySelectorAll('li')[1];

    // Create a new MutationObserver
    const addressLoadingObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
                const isHidden = checkingAddressElement.hasAttribute('hidden');
                if (isHidden && continueButtonIsVisible(innerContinueButtonContainer)) {
                    console.log("Eligible");
                    console.log("----Answer------");
                    eligibleAddresses.push(addresses[currentIndex]);
                    currentIndex++;
                    runAddressCheck(addressSearchBox, addresses[currentIndex], ulElement, dropdownObserver, addressLoadingObserver, currentIndex, numAddresses, eligibleAddresses, ineligibleAddresses);
                } else if (isHidden && !continueButtonIsVisible(innerContinueButtonContainer)) {
                    console.log("Ineligible");
                    console.log("----Answer------");
                    ineligibleAddresses.push(addresses[currentIndex]);
                    currentIndex++;
                    runAddressCheck(addressSearchBox, addresses[currentIndex], ulElement, dropdownObserver, addressLoadingObserver, currentIndex, numAddresses, eligibleAddresses, ineligibleAddresses);
                }
        }
    });
    // Start observing the "hidden" attribute of the element
    addressLoadingObserver.observe(checkingAddressElement, { attributes: true });

    runAddressCheck(addressSearchBox, addresses[currentIndex], ulElement, dropdownObserver, addressLoadingObserver, currentIndex, numAddresses, eligibleAddresses, ineligibleAddresses);
}

function runAddressCheck(addressSearchBox, address, ulElement, dropdownObserver, addressLoadingObserver, currentIndex, numAddresses, eligibleAddresses, ineligibleAddresses) {
    console.log("currentIndex:");
    console.log(currentIndex);
    console.log("numAddresses:");
    console.log(numAddresses);
    if(currentIndex === numAddresses) {
        dropdownObserver.disconnect();
        addressLoadingObserver.disconnect();
        console.log("done");
        console.log("Eligible Addresses:");
        console.log(eligibleAddresses);
        console.log(" ");
        console.log("Ineligible Addresses:");
        console.log(ineligibleAddresses);
        const doneDiv = document.createElement("div");
        doneDiv.style.fontWeight = "bold";
        const eligibleParagraphHeader = document.createElement('p');
        eligibleParagraphHeader.textContent = "Eligible Addresses:";
        eligibleParagraphHeader.style.color = "green";
        doneDiv.appendChild(eligibleParagraphHeader);
        for (let i = eligibleAddresses.length - 1; i >= 0; i--) {
            // Create a new <p> element
            const newParagraph = document.createElement('p');

            // Assign text content from the array to the <p> element
            newParagraph.textContent = eligibleAddresses[i];

            // Append the new <p> element to the existing div
            doneDiv.appendChild(newParagraph);
        }
        //const doneParagraph = document.createElement("p");
        //doneParagraph.textContent = eligibleAddresses + "\n" + ineligibleAddresses;
        addressSearchBox.insertAdjacentElement('afterend', doneDiv);
        return;
    }
    console.log("----AddressCheck(first)------");
    console.log(address);
    simulateUserInput(addressSearchBox, address);
    // Configure and start observing the UL element for changes
    dropdownObserver.observe(ulElement, { childList: true, subtree: true });
}

// Create a function to be executed when the condition is met
function searchForAddressOnDropdownLoad(ulElement) {
    // Get the first <li> element within the <ul>
    const firstLiElement = ulElement.querySelector('li');
    // Get the button within the first <li> element
    const buttonWithinFirstLi = firstLiElement.querySelector('button');
    buttonWithinFirstLi.click();
}

function continueButtonIsVisible(innerContinueButtonContainer) {
    return !innerContinueButtonContainer.hasAttribute('hidden');
}

function simulateUserInput(inputElement, text) {
  var inputEvent = new Event('input', { bubbles: true });
  var changeEvent = new Event('change', { bubbles: true });

  // Set the value programmatically
  inputElement.value = text;

  // Dispatch the input and change events
  inputElement.dispatchEvent(inputEvent);
  inputElement.dispatchEvent(changeEvent);
}