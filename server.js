const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');


const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls
app.get('/api/matches', (req, res) => {
    console.log("inside api matches");
    var headers = {
        'Referer': 'https://www.dream11.com/leagues',
        'Origin': 'https://www.dream11.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
        'content-type': 'application/json'
    };

    var dataString = '{"returnType":"response","query":"query HomeSiteMatchQuery($slug: String = null) { site(slug: $slug) { slug name tours { id name } matches(page: 0, statuses: [NOT_STARTED]) { edges { id name startTime status squads { id name shortName flag { src type } flagWithName { src type } } tour { id name slug } } } }}","variables":{"slug":"cricket"}}';

    var options = {
        url: 'https://www.dream11.com/graphql',
        method: 'POST',
        headers: headers,
        body: dataString
    };

    request(options, function (err, response, body) {
      console.log(err);
      console.log(response.body);
        if (err) {
            res.send({error: 'Request Failed'});
        }
        else{
            var matches = JSON.parse(response.body);
            res.send({ matches: matches['data']['site']['matches']['edges']});
        }
    });
  
});

app.get('/api/players', (req, res) => {
  var request = require('request');

  var headers = {
      'Referer': 'https://www.dream11.com/cricket/create-team/927/12767?returnUrl=%2Fcricket%2Fleagues%2Fsa-t20-super-league%2F927%2F12767',
      'Origin': 'https://www.dream11.com',
      'device': 'pwa',
      'X-CSRF': '6f253477-9e9f-5bad-d7e7-624e8d0a7379',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
      'content-type': 'application/json'
  };
  var tourId = req.query.tourId;
  var matchId = req.query.matchId;
  var dataString = '{"returnType":"response","query":"query CreateTeamQuery( $site: String! $tourId: Int! $teamId: Int = -1 $matchId: Int!) { site(slug: $site) { name teamPreviewArtwork { src } teamCriteria { totalCredits maxPlayerPerSquad totalPlayerCount } roles { id artwork { src } color name pointMultiplier shortName } playerTypes { id name minPerTeam maxPerTeam shortName artwork { src } } tour(id: $tourId) { match(id: $matchId) { id guru squads { flag { src } flagWithName { src } id jerseyColor name shortName } startTime status players(teamId: $teamId) { artwork { src } squad { id name jerseyColor shortName } credits id name points type { id maxPerTeam minPerTeam name shortName } isSelected role { id artwork { src } color name pointMultiplier shortName } } } } } me { isGuestUser }}","variables":{"tourId":'+tourId+',"matchId":'+matchId+',"teamId":null,"site":"cricket"}}';

  console.log(dataString);
  // var variables = JSON.parse(dataString)
  // console.log(JSON.parse(dataString));
  var options = {
      url: 'https://www.dream11.com/graphql',
      method: 'POST',
      headers: headers,
      body: dataString
  };

  request(options, function (err, response, body) {
      //console.log(err);
      //console.log(response.body);
      if (err) {
          res.send({error: 'Request Failed'});
      }
      else{
          var players = JSON.parse(response.body);
          res.send({ players: players['data']['site']['tour']['match']['players']});
      }
    });
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));