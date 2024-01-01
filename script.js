document.addEventListener("DOMContentLoaded", function () {
    const numberButtonsContainer = document.getElementById("number-buttons");
    const highlightedItems = document.getElementById("highlighted-items");

    const temps = ["55", "50", "45", "40", "35", "30", "25", "20"];

    // map clothing options to images
    const clothingImages = {
        "shirt": "shirt.png",
        "longsleeve": "longsleeve.png",
        "fleece": "fleece.png",
        "shorts": "shorts.png",
        "tights": "tights.png",
        "joggers": "joggers.png",
        "cap": "cap.png",
        "beanie": "beanie.png",
        "gloves": "gloves.png",
        "scarf": "scarf.png"
        // Add URLs for other options here
    };

    // update highlighted items based on the selected number
    function displayClothing(selectedTemp) {
        const outfitsByTemp = {
            "55": ["shirt", "shorts", "cap"],
            "50": ["longsleeve", "shorts", "cap"],
            "45": ["shirt", "longsleeve", "shorts", "cap"],
            "40": ["shirt", "fleece", "shorts", "cap", "gloves"],
            "35": ["shirt", "fleece", "jacket", "joggers", "beanie", "gloves"],
            "30": ["longsleeve", "fleece", "jacket", "shorts", "joggers", "beanie", "gloves"],
            "25": ["longsleeve", "fleece", "jacket", "tights", "joggers", "beanie", "gloves"],
            "20": ["longsleeve", "fleece", "jacket", "tights", "joggers", "beanie", "gloves", "scarf"]
        };

        const suggestedClothing = outfitsByTemp[selectedTemp] || [];

        // clear previous highlights
        highlightedItems.innerHTML = "";

        // display highlighted item images
        suggestedClothing.forEach((item) => {
            if (clothingImages[item]) {
                const image = document.createElement("img");
                image.src = clothingImages[item];
                image.className = "clothingImage";

                setTimeout(() => {
                    image.classList.add("show");
                }, 100);
                highlightedItems.appendChild(image);
            }
        });
    }

    // create temp buttons
    temps.forEach((temp) => {
        const button = document.createElement("button");
        button.textContent = temp;
        button.className = "temp-button";
        button.addEventListener("click", () => {
            displayClothing(temp);
        });
        numberButtonsContainer.appendChild(button);
    });

    // wardrobe display of all clothing options available
    for (item in clothingImages) {
        const image = document.createElement("img");
        image.src = clothingImages[item];
        image.className = "clothingImage";

        setTimeout(() => {
            image.classList.add("show");
        }, 100);
        wardrobe.appendChild(image);
    };

    // update on initial page load
    displayClothing(temps[0]);
});