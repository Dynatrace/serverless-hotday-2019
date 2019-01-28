const axios = require('axios');

const googleApiKey = process.env.GOOGLE_API_KEY;
const nasaApiKey = process.env.NASA_API_KEY;

/**
 * Fetches the current location of the ISS
 */
async function getIssLocation() {
  try {
    const response = await axios.get('http://api.open-notify.org/iss-now.json');
    return response.data.iss_position;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches the current ISS crew
 */
async function getIssCrew() {
  try {
    const response = await axios.get('http://api.open-notify.org/astros.json');
    return response.data.people.map((person) => person.name);
  } catch (err) {
    return [];
  }
}

/**
 * Tries to find an image of a given lat/long coordinate at lambda and returns a
 * kitten otherwise
 * @param {*} lat
 * @param {*} long
 */
async function getIssImageryUrl(lat, long) {
  try {
    const response = await axios.get(`https://api.nasa.gov/planetary/earth/imagery/?lon=${long}&lat=${lat}&date=2017-01-01&cloud_score=True&api_key=${nasaApiKey}`);
    return response.data.url;
  } catch (err) {
    return 'https://placekitten.com/512/512';
  }
}

/**
 * Tries to reverse geocode lat/long coordinates
 * @param {*} lat
 * @param {*} long
 */
async function reverseGeocode(lat, long) {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${googleApiKey}`);
    console.log(response.data.results[0]);
    if (response.data.results && response.data.results[0] && response.data.results[0].formatted_address)
      return response.data.results[0].formatted_address;
    throw new Error('No map data found');
  } catch (err) {
    return `Unnamed territory at Lat, Long: ${lat}, ${long}`;
  }
}

/**
 * Returns a static maps URL for given lat/long coordinates
 * @param {*} lat
 * @param {*} long
 */
function getMapsUrl(lat, long) {
  return `https://maps.googleapis.com/maps/api/staticmap?zoom=1&size=600x400&maptype=hybrid&&key=${googleApiKey}&markers=color:red%7Clabel:I%7C${lat},${long}`;
}

/**
 * Handler function
 */
module.exports.handler = async (event, context, callback) => {
  try {
    const issPosition = await getIssLocation();
    const imagery = await getIssImageryUrl(issPosition.latitude, issPosition.longitude);
    const rGeoCode = await reverseGeocode(issPosition.latitude, issPosition.longitude);
    const crewMembers = await getIssCrew();

    /*
    // Will be explained later
    const [issPosition, crewMembers] = await Promise.all([getIssLocation(), getIssCrew()]);
    const [imagery, rGeoCode] = await Promise.all([getIssImageryUrl(
      issPosition.latitude,
      issPosition.longitude),
    reverseGeocode(issPosition.latitude, issPosition.longitude)
    ]);
    */

    const map = getMapsUrl(issPosition.latitude, issPosition.longitude);

    const html = `
    <!DOCTYPE html>
    <html lang='en'>
        <head>
          <title>Current ISS Location</title>
          <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS"
            crossorigin="anonymous">
          <meta charset="utf-8" />
        </head>
        <body>
          <div class='container mt-4'>
            <div class='row'>
              <div class="col-sm">
                <div class="card">
                  <img class="card-img-top" src="${map}" alt="Map of ${rGeoCode}">
                  <div class="card-body">
                    <h5 class="card-title">ISS Location</h5>
                    <p class="card-text">The ISS is currently over <strong>${rGeoCode}</strong></p>
                  </div>
                </div>
              </div>
              <div class="col-sm">
                <div class="card">
                  <img class="card-img-top" src="${imagery}" alt="Detail of ${rGeoCode}">
                  <div class="card-body">
                    <h5 class="card-title">Imagery of the area | Current crew</h5>
                    <p class="card-text">${crewMembers.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>`
    return callback(null, {
      statusCode: 200,
      headers: {
        'content-type': 'text/html',
      },
      body: html,
    });

  } catch (err) {
    return callback(err);
  }
};
