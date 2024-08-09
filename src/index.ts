import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GHL } from "./ghl";
import * as CryptoJS from 'crypto-js';
import { json } from "body-parser";

const path = __dirname + "/ui/dist/";

dotenv.config();
const app: Express = express();
app.use(json({ type: 'application/json' }));

// Interface for TokenData
interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  userType: string;
  companyId: string;
  locationId: string;
  userId: string;
}

// Initialize the GHL class
const ghl = new GHL();
const port = process.env.PORT;

// Token store to keep tokens keyed by locationId
const tokenStore: { [key: string]: TokenData } = {}; // Simple in-memory store

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
    // Handle the authorization process and retrieve token data
    const tokenData = await ghl.authorizationHandler(code as string);

    // Debug output
    console.log("Authorization Code:", code);
    console.log("Token Data:", tokenData);

    // Store the token data using locationId as the key
    tokenStore[tokenData.locationId] = tokenData;

    // Respond with the authorization details
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

// Route to make an example API call using the company ID
app.get("/example-api-call", async (req: Request, res: Response) => {
  if (ghl.checkInstallationExists(req.query.companyId as string)) {
    try {
      const request = await ghl
        .requests(req.query.companyId as string)
        .get(`/users/search?companyId=${req.query.companyId}`, {
          headers: {
            Version: "2021-07-28",
          },
        });
      return res.send(request.data);
    } catch (error) {
      console.log(error);
    }
  }
  return res.send("Installation for this company does not exist");
});

// Route to make an example API call using the location ID
app.get("/example-api-call-location", async (req: Request, res: Response) => {
  try {
    const { companyId, locationId } = req.query;

    if (!companyId || !locationId) {
      return res.status(400).send("companyId and locationId are required");
    }

    // Retrieve token data from the store
    const tokenData = tokenStore[locationId as string];
    if (!tokenData || !tokenData.access_token) {
      return res.status(400).send("No stored token found for this location");
    }

    // Make the API request using the stored token
    const request = await ghl
      .requests(locationId as string)
      .get(`/contacts/?locationId=${locationId}`, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Version: "2021-07-28",
        },
      });

    console.log("API Response:", request.data);
    return res.send(request.data);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).send("An error occurred while fetching contacts");
  }
});

// Route to handle webhook events
app.post("/example-webhook-handler", async (req: Request, res: Response) => {
  console.log(req.body);
  res.status(200).send("Webhook received");
});

// Route to decrypt SSO data
app.post("/decrypt-sso", async (req: Request, res: Response) => {
  const { key } = req.body || {};
  if (!key) {
    return res.status(400).send("Please send a valid key");
  }
  try {
    const data = ghl.decryptSSOData(key);
    res.send(data);
  } catch (error) {
    res.status(400).send("Invalid Key");
    console.error(error);
  }
});

// Serve the main HTML file
app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

// Start the Express server
app.listen(port, () => {
  console.log(`GHL app listening on port ${port}`);
});
