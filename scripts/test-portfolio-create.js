
async function testPortfolioCreate() {
    console.log("Testing /api/portfolio creation...");
    try {
        const res = await fetch('http://localhost:3000/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: "Creative",
                location: "Test Location",
                src: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
            })
        });

        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Response data:", data);

        if (!res.ok) {
            console.error("Failed:", data);
        }
    } catch (err) {
        console.error("Network error:", err);
    }
}

testPortfolioCreate();
