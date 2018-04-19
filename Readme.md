
# RAPIDocGen v1.1.3


Simple script to transform postman test collections v2.1 to a swagger file


##### Installation

Using npm

```
$ npm install -g rapidocgen
```

##### Usage


```
 $ rapidocgen <filepath> [<outputPath>]
```

#### <span style="color:red">Known Issues</span>


-  Only application/json & text/plain is parsable
-  --help command is not implemented
-  Collection structure must follow Collection -> folders -> saved requests


### Guidelines

To parse a variable path use postman's variables implementation like the following example

![Postman variable path example](https://i.imgur.com/an9ihtV.png )

Edit the collection to add the matching variables with their value so you can test your requests

![Postman variable path example 2](https://i.imgur.com/kARJPmv.png)


Path responses will use the postman saved responses to build path responses
`If no responses are available default will be 200: 'ok'`

![Imgur](https://i.imgur.com/A5BO9aX.png)


### Changelog


#### v1.1.2
> - Fixed an issue where path variables wouldn't be parsed correctly into path parameters
> - Script won't crash now if there is a request outside a folder, it won't parse it yet
> - Modulirized code

#### v1.0.5
> - Output path issue fixed, user can now specify path & file name, `Default is set to 'RAPI_Docs.yml'`
> - Updated docs with variable params example & default response


#### v1.0.0

> RAPIDocGen v1.0.0
