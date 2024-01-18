// Program created by Nekzerd
// Created on 28/12/2023

const fs = require("fs");
const ytdl = require("ytdl-core");
const { google } = require("googleapis");
const path = require("path");
const child_process = require("child_process");
const axios = require("axios");
const xml2js = require("xml2js");

// Connect to the API

const API_KEY = "YOUR_API_KEY";
const youtube = google.youtube({
  version: "v3",
  auth: API_KEY,
});

const downloadedVideosPath = "./downloadedVideos.json";
let downloadedVideos = [];
if (fs.existsSync(downloadedVideosPath)) {
  downloadedVideos = JSON.parse(fs.readFileSync(downloadedVideosPath));
}

let downloadedCount = 0;

// Function to get subtitles
async function getSubtitles(videoId, language) {
  const response = await axios.get(
    `http://video.google.com/timedtext?lang=${language}&v=${videoId}`
  );
  const result = await xml2js.parseStringPromise(response.data);
  if (result && result.transcript && result.transcript.text) {
    return result.transcript.text.map((item) => item._);
  } else {
    console.log(`No subtitles available for video ${videoId}`);
    return [];
  }
}

// Function to search for videos and send them to the download function

async function searchAndDownloadVideos() {
  try {
    // Exclude YouTube category
    const excludedCategories = [
      "2",
      "10",
      "15",
      "17",
      "19",
      "23",
      "24",
      "26",
      "27",
      "29",
      "34",
      "36",
      "37",
      "38",
      "41",
    ];

    // List of all video categories
    const categoriesResponse = await youtube.videoCategories.list({
      part: "snippet",
      regionCode: "FR",
    });

    const categories = categoriesResponse.data.items;

    // Filter out excluded categories
    const filteredCategories = categories.filter(
      (category) => !excludedCategories.includes(category.id)
    );

    // Search and download videos based on the filter
    for (const category of filteredCategories) {
      if (downloadedCount >= 10) {
        break;
      }
      const response = await youtube.videos.list({
        part: "snippet",
        chart: "mostPopular",
        regionCode: "FR",
        videoCategoryId: category.id,
        maxResults: 75, // Increase the number of results to have more videos to choose from
        hl: "fr",
      });

      const videos = response.data.items;

      for (const video of videos) {
        if (downloadedCount >= 10) {
          break;
        }
        const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
        try {
          const outputPath = "./videos"; // Folder where downloaded videos will be stored
          await downloadVideo(videoUrl, outputPath);
          const videoId = ytdl.getURLVideoID(videoUrl);
          const subtitles = await getSubtitles(videoId, "fr");
          fs.writeFileSync(
            path.join(outputPath, "subtitles.txt"),
            subtitles.join("\n")
          );
        } catch (error) {
          console.error("Error processing video:", error.message);
        }
      }
    }
  } catch (error) {
    console.error("Error searching for videos:", error.message);
  }
}

// Function to split videos

async function splitVideo(fullOutputPath) {
  const outputFolder = "videos_cut"; // Folder where split videos will be sent
  const fileName = path.basename(fullOutputPath, path.extname(fullOutputPath));
  const command = `ffmpeg -i ${fullOutputPath} -vf "crop=in_h*9/16:in_h" -c:a copy ${outputFolder}/${fileName}_temp.mp4`;
  child_process.exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`Error cropping video: ${error}`);
    }
  });
}

// Function to download videos

async function downloadVideo(url, outputFolder) {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(videoInfo.formats, { quality: "highest" });

    // Check if the video has already been downloaded
    if (downloadedVideos.includes(videoInfo.videoDetails.videoId)) {
      console.log(`Video ${url} has already been downloaded.`);
      return;
    }

    // Filter to ignore videos below 70 seconds
    if (format && videoInfo.videoDetails.lengthSeconds > 70) {
      const videoTitle = `video_${videoInfo.videoDetails.videoId}.${format.container}`;
      const fullOutputPath = path.join(outputFolder, videoTitle);

      ytdl(url, { format: format })
        .pipe(fs.createWriteStream(fullOutputPath))
        .on("finish", () => {
          console.log(`Video ${url} downloaded successfully.`);
          downloadedVideos.push(videoInfo.videoDetails.videoId);
          downloadedCount++;
          fs.writeFileSync(
            downloadedVideosPath,
            JSON.stringify(downloadedVideos)
          );
          splitVideo(fullOutputPath); // Split the video after downloading
        });
    }
  } catch (error) {
    console.error("Error downloading video:", error.message);
  }
}

// Call the function to start downloading
searchAndDownloadVideos();
