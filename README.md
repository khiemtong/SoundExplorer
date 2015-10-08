# Sound Explorer

Simple exploration project using node to create a shared DJing application. Music is powered by the SoundCloud API.

## Configuration

To run the application a configuration object with the relevant SoundCloud API credentials needs to be supplied.

````JavaScript
  {
    "SoundCloud" : {

      "clientId" : "<CLIENT ID>",
      "clientSecret": "<CLIENT SECRET>",
      "redirectUrl" : "<CALLBACK URL>"

    }
  }
```
