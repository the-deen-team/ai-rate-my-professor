import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req) {
  const { url } = await req.json();

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
      const name = document.querySelector(
        ".NameTitle__Name-dowf0z-0"
      ).innerText;
      const institution = document.querySelector(
        ".InstitutionName__Name-sc-1hbi42b-0"
      ).innerText;
      const subject = document.querySelector(
        ".CourseRating__Subject-sc-1twb0wp-0"
      ).innerText;
      const rating = document.querySelector(
        ".RatingValue__Numerator-qw8sqy-2"
      ).innerText;

      return {
        name,
        institution,
        subject,
        rating,
      };
    });

    await browser.close();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error scraping professor data:", error);
    return NextResponse.json({
      error: "Failed to scrape the data. Please check the URL and try again.",
    });
  }
}
