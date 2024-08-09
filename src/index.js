var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import dotenv from "dotenv";
import { processTasksAndNotes, tokenStore } from "./tasks-and-notes";
import { GHL } from "./ghl";
import path from "path";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
// Route to start the OAuth flow
app.get("/start-auth", (req, res) => {
    const scopes = "contacts.readonly contacts.write users.readonly";
    console.log("Scopes:", scopes);
    const authUrl = `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent('http://localhost:3000/authorize-handler')}&client_id=${process.env.GHL_APP_CLIENT_ID}&scope=${encodeURIComponent(scopes)}`;
    res.redirect(authUrl);
});
// Route to handle the authorization callback and store tokens
app.get("/authorize-handler", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    if (!code) {
        console.error("Authorization code is missing");
        return res.status(400).send("Authorization code is missing");
    }
    try {
        // Create an instance of GHL
        const ghl = new GHL();
        // Handle the authorization process and retrieve token data
        const tokenData = yield ghl.authorizationHandler(code); // Explicitly assert the type
        console.log("Authorization Code:", code);
        console.log("Token Data:", tokenData);
        // Store the token data using locationId as the key
        if (tokenData && tokenData.locationId) {
            tokenStore[tokenData.locationId] = tokenData;
        }
        else {
            throw new Error("locationId is missing in token data");
        }
        // Respond with all the relevant data
        res.status(200).json(Object.assign({ message: "Authorization successful", authorizationCode: code }, tokenData));
    }
    catch (error) {
        console.error("Error handling authorization:", error);
        res.status(500).send("Error during authorization");
    }
}));
// Route to process tasks and notes
app.get("/run-process", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield processTasksAndNotes();
    res.send("Processing complete");
}));
// Serve the main HTML file
app.get("/", function (req, res) {
    res.sendFile(path + "index.html");
});
// Start the Express server
app.listen(port, () => {
    console.log(`GHL app listening on port ${port}`);
});
