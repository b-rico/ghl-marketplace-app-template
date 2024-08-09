import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { processTasksAndNotes, tokenStore } from "./tasks-and-notes";
import { GHL } from "./ghl";
import { TokenData } from "./types"; // Import the TokenData interface
import path from "path";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Route to start the OAuth flow
app.get("/start-auth", (req: Request, res: Response) => {
  const scopes = "contacts.readonly contacts.write users.readonly";
  console.log("Scopes:", scopes);
  const authUrl = `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent('http://localhost:3000/authorize-handler')}&client_id=${process.env.GHL_APP_CLIENT_ID}&scope=${encodeURIComponent(scopes)}`;
  res.redirect(authUrl);
});

// Route to handle the authorization callback and store tokens
app.get("/authorize-handler", async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    console.error("Authorization code is missing");
    return res.status(400).send("Authorization code is missing");
  }

  try {
    // Create an instance of GHL
    const ghl = new GHL();

    // Handle the authorization process and retrieve token data
    const tokenData = await ghl.authorizationHandler(code as string) as unknown as TokenData;  // Explicitly assert the type

    console.log("Authorization Code:", code);
    console.log("Token Data:", tokenData);

    // Store the token data using locationId as the key
    if (tokenData && tokenData.locationId) {
      tokenStore[tokenData.locationId] = tokenData;
    } else {
      throw new Error("locationId is missing in token data");
    }

    // Respond with all the relevant data
    res.status(200).json({
      message: "Authorization successful",
      authorizationCode: code,
      ...tokenData, // Spread the token data in the response
    });
  } catch (error) {
    console.error("Error handling authorization:", error);
    res.status(500).send("Error during authorization");
  }
});

// Route to process tasks and notes
app.get("/run-process", async (req: Request, res: Response) => {
  await processTasksAndNotes();
  res.send("Processing complete");
});

// Serve the main HTML file
app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

// Start the Express server
app.listen(port, () => {
  console.log(`GHL app listening on port ${port}`);
});
