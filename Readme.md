
# RAPIDocGen v1.1.4


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

To parse a variable path use postman's as the following example

![Postman variable path example](https://i.imgur.com/an9ihtV.png )

Edit the collection to add the matching variables with their value so you can test your requests

![Postman variable path example 2](https://i.imgur.com/kARJPmv.png)


Request responses will use postman's to build example responses'
`If no responses are available default will be 200: 'ok'`

![Imgur](https://i.imgur.com/A5BO9aX.png)


### Changelog

#### v1.2.0
> - RAPIDocGen abbreviation command added, rdg now available
> - Script will now parse urlencoded body
> - Fixed an issue where $ref paths would have spaces in between, causing yml errors
> - Nested objects wont destroy response objects now (Will keep an eye on this one)
> - IMPORTANT: Currently the script is unable to parse multiple same response code, if there are any, response objects will be created and only the last will be shown automatically

#### v1.1.2
> - Fixed an issue where path variables wouldn't be parsed correctly into path parameters
> - Script won't crash now if there is a request outside a folder, it won't parse it yet
> - Modulirized code

#### v1.0.5
> - Output path issue fixed, user can now specify path & file name, `Default is set to 'RAPI_Docs.yml'`
> - Updated docs with variable params example & default response


#### v1.0.0

> RAPIDocGen v1.0.0
