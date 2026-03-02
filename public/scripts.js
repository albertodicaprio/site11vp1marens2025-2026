fetch("/header.html").then(r => r.text()).then(t => {
    document.getElementById("header").innerHTML = t;
    setupBurgerMenu();
});

function setupBurgerMenu() {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        });
    });
}

fetch("/api/logout_button").then(r => r.json()).then(t => {
    document.getElementById("logout_button").innerHTML = t.html;
});

async function login() {
    const password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (data.success) {
        window.location.href = "/private.html";
    } else {
        alert("Wrong password");
    }
}

async function logout() {
    await fetch("/api/logout", { cache: 'no-store' });
    location.href = "/index.html";
}
