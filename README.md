# Sound Explorer

Simple exploration project using node to create a shared DJing application. Music is powered by the SoundCloud API.

## Configuration

To run the application a configuration object with the relevant SoundCloud API credentials needs to be supplied.

1. Run `mkdir config`
2. Run `vi config/default.json`
3. Copy into file

````JavaScript
  {
    "SoundCloud" : {

      "clientId" : "<CLIENT ID>",
      "clientSecret": "<CLIENT SECRET>",
      "redirectUrl" : "<CALLBACK URL>"

    }
  }
```

4. Fill in credentails
5. In `js/searchController.js`, set SoundCloud client id

```javascript
    // Initialize client id here
    var scClientID = '<CLIENT_ID_HERE>';
    SoundCloudService.init(scClientID);
```

## Setup

* `npm install`
* `bower install`
* `npm start`
