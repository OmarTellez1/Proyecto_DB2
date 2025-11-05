const u = JSON.parse(localStorage.getItem("user") || "null");
if (!u) location.replace("/login");