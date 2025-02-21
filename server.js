const express = require("express");
const app = express();
const path = require("path");

// Statická složka (pokud používáš CSS nebo JS soubory)
app.use(express.static("public"));

// Odeslání hlavní stránky
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
});
