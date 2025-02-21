const express = require("express");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const DATA_FILE = "documents.json";

// Načítání dokumentů ze souboru
function loadDocuments() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
    return [];
}

// Ukládání dokumentů do souboru
function saveDocuments(documents) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(documents, null, 2), "utf8");
}

// Přidání dokumentu
app.post("/add-document", (req, res) => {
    const documents = loadDocuments();
    documents.push(req.body);
    saveDocuments(documents);
    res.json({ success: true });
});

// Odstranění dokumentu
app.post("/delete-document", (req, res) => {
    let documents = loadDocuments();
    documents = documents.filter(doc => doc.name !== req.body.name || doc.expiry !== req.body.expiry);
    saveDocuments(documents);
    res.json({ success: true });
});

// Konfigurace e-mailu
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com", // Tvůj e-mail
        pass: "your-password" // Tvůj heslo nebo App Password (doporučeno)
    }
});

// Kontrola vypršení dokumentů
function checkExpiry() {
    const documents = loadDocuments();
    const today = new Date();
    
    documents.forEach(doc => {
        const expiryDate = new Date(doc.expiry);
        const notificationPeriod = parseInt(doc.notification, 10);
        const notificationDate = new Date(expiryDate);
        notificationDate.setMonth(expiryDate.getMonth() - notificationPeriod);
        
        if (today >= notificationDate && today < expiryDate) {
            sendEmail(doc.email, doc.name, doc.expiry);
        }
    });
}

// Odeslání e-mailu
function sendEmail(to, documentName, expiryDate) {
    const mailOptions = {
        from: "your-email@gmail.com",
        to,
        subject: "Upozornění na vypršení dokumentu",
        text: `Dokument "${documentName}" vyprší dne ${expiryDate}. Prosím, zkontrolujte jej.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Chyba při odesílání e-mailu:", error);
        } else {
            console.log("E-mail odeslán:", info.response);
        }
    });
}

// Automatická kontrola expirace každých 24 hodin
setInterval(checkExpiry, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
    checkExpiry();
});
