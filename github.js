const express    = require("express"),
      cors       = require("cors"),
      bodyParser = require("body-parser"),
      FormData   = require("form-data"),
      fetch      = require("node-fetch")
;
const app = express();

const secrets = require("./src/secrets.js");

app.use(bodyParser.json());
app.use(bodyParser.json({ type: "text/*" }));
app.use(bodyParser.urlencoded({ extended: false }));

var corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  }
}
app.use(cors(corsOptions))

app.post("/authenticate", (req, res) => {
  const { redirect_uri, code } = req.body;

  const data = new FormData();
  data.append("client_id",     secrets.ghClientId);
  data.append("client_secret", secrets.ghClientSecret);
  data.append("code",          code);
  data.append("redirect_uri",  redirect_uri);

  // Request to exchange code for an access token
  fetch(`https://github.com/login/oauth/access_token`, {
    method:  "POST",
    body:    data,
    headers: { "Accept": "application/json" },
  })
  .then(response => {
    return response.json()
  })
  .then(response => {
    let params = new URLSearchParams(response);
    let respData = {
      at: params.get("access_token"),
      rt: params.get("refresh_token")
    }

    return res.status(200).json(respData);
  });
});

const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
