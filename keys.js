console.log('this is loaded');

exports.spotify = {
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
};
exports.otherKeys = {
    omdb_key: process.env.OMDB_SECRET,
    bands_key: process.env.BANDS_ID
}

