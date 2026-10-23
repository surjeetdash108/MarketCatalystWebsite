// scripts/notify-google.mjs -> node scripts/notify-google.mjs URL_UPDATED https://marketcatalyst.ai/careers/data-analyst
import { google } from "googleapis";

const [type = "URL_UPDATED", ...urls] = process.argv.slice(2);
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // path to the service-account JSON key
  scopes: ["https://www.googleapis.com/auth/indexing"],
});
const indexing = google.indexing({ version: "v3", auth });

for (const url of urls) {
  const res = await indexing.urlNotifications.publish({ requestBody: { url, type } });
  console.log(type, url, res.status, res.data.urlNotificationMetadata?.latestUpdate?.notifyTime);
}
