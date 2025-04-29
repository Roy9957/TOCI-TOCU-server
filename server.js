const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const PORT = process.env.PORT || 3000;
const GAME_FILE_PATH = path.join(__dirname, 'game.apk'); // Rename your APK to game.apk

// Check if game file exists
if (!fs.existsSync(GAME_FILE_PATH)) {
  console.error('Game file not found! Please place your APK file as game.apk in the root directory');
  process.exit(1);
}

// Routes
app.get('/', (req, res) => {
  res.send('Game Download Server is running');
});

app.get('/download', (req, res) => {
  const filePath = GAME_FILE_PATH;
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Handle partial content (for progress tracking)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'application/vnd.android.package-archive',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // Full download
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename=game.apk'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
