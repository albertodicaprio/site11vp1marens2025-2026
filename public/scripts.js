fetch("/header.html").then(r => r.text()).then(t => {
    document.getElementById("header").innerHTML = t;
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
        window.location.href = "/secret.html";
    } else {
        alert("Wrong password");
    }
}

async function logout() {
    await fetch("/api/logout");
    location.href = "/index.html";
}