let count = 0;

const backgrounds = [
    "https://picsum.photos/500/700?random=1",
    "https://picsum.photos/500/700?random=2",
    "https://picsum.photos/500/700?random=3",
    "https://picsum.photos/500/700?random=4",
    "https://picsum.photos/500/700?random=5"
];

const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");
const counterElement = document.getElementById("counter");
const promptInput = document.getElementById("quotePrompt");
const generateBtn = document.getElementById("generateBtn");
const statusElement = document.getElementById("status");
const quoteWheel = document.getElementById("newQuoteBtn");
const quoteCard = document.getElementById("quoteCard");

// Generate a quote using our backend.
// The Gemini API key NEVER comes to this browser.
async function generateQuote() {

    const topic = promptInput.value.trim();

    if (!topic) {
        statusElement.textContent = "Please enter what kind of quote you want.";
        promptInput.focus();
        return;
    }

    setLoading(true);
    statusElement.textContent = "✨ Quoteverse is creating your quote...";

    try {

        const response = await fetch("/api/generate-quote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                topic: topic
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to generate quote.");
        }

        showQuote(data.quote, data.author);

        statusElement.textContent = "✨ New AI quote generated!";
        count++;

        counterElement.textContent =
            "Quotes Generated: " + count;

    } catch (error) {

        console.error(error);

        statusElement.textContent =
            "❌ " + error.message;

    } finally {

        setLoading(false);

    }
}

// Display quote on the card.
function showQuote(quote, author = "QuoteVerse AI") {

    quoteElement.textContent = `"${quote}"`;
    authorElement.textContent = "- " + author;

    const randomBg =
        backgrounds[Math.floor(Math.random() * backgrounds.length)];

    quoteCard.style.backgroundImage = `url(${randomBg})`;
    quoteCard.style.backgroundSize = "cover";
    quoteCard.style.backgroundPosition = "center";
}

// Generate another quote using the same user preference.
function generateAnotherQuote() {

    if (!promptInput.value.trim()) {
        statusElement.textContent =
            "Enter a topic first, then use the ✨ wheel.";
        promptInput.focus();
        return;
    }

    quoteWheel.classList.remove("rotate");

    // Restart the wheel animation.
    void quoteWheel.offsetWidth;

    quoteWheel.classList.add("rotate");

    generateQuote();
}

// Loading state.
function setLoading(isLoading) {

    generateBtn.disabled = isLoading;
    quoteWheel.style.pointerEvents = isLoading ? "none" : "auto";

    if (isLoading) {
        generateBtn.textContent = "Generating...";
    } else {
        generateBtn.textContent = "✨ Generate";
    }
}

// Download Quote Card.
function downloadCard() {

    html2canvas(quoteCard, {
        useCORS: true
    }).then(function (canvas) {

        const link = document.createElement("a");

        link.download = "QuoteVerse.png";
        link.href = canvas.toDataURL("image/png");

        link.click();

    }).catch(function (error) {

        console.error(error);
        alert("Unable to download the quote card.");

    });
}

// Share Quote Card.
async function shareImage() {

    try {

        const canvas = await html2canvas(
            quoteCard,
            {
                useCORS: true
            }
        );

        canvas.toBlob(async function (blob) {

            if (!blob) return;

            const file = new File(
                [blob],
                "QuoteVerse.png",
                {
                    type: "image/png"
                }
            );

            if (
                navigator.canShare &&
                navigator.canShare({ files: [file] })
            ) {

                await navigator.share({
                    title: "QuoteVerse",
                    text: "🌿 AI Daily Inspiration",
                    files: [file]
                });

            } else if (navigator.share) {

                await navigator.share({
                    title: "QuoteVerse",
                    text: quoteElement.textContent
                });

            } else {

                alert("Sharing is not supported on this browser.");

            }

        });

    } catch (error) {

        console.error(error);
        alert("Unable to share the quote card.");

    }
}

// Button Events.
generateBtn.addEventListener("click", generateQuote);

quoteWheel.addEventListener("click", generateAnotherQuote);

document.getElementById("downloadBtn")
    .addEventListener("click", downloadCard);

document.getElementById("shareBtn")
    .addEventListener("click", shareImage);

// Press Enter inside the input to generate.
promptInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        generateQuote();
    }

});
