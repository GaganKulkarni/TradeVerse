// Preview the built public website without taking over another app's port.
const express = require("express");
const path = require("node:path");
const app = express();
const root = path.resolve(__dirname, "../frontend/build");
app.use(express.static(root));
app.get("/{*splat}", (req, res) => res.sendFile(path.join(root, "index.html")));
app.listen(3003, () => console.log("TradeVerse website: http://localhost:3003"));
