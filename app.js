const yaml = require('write-yaml');
const fs = require('fs');

let swagger = {
  'swagger': '2.0',
  'info': {
    'description': "API description of the database connection",
    'version': '1.0.0',
    'title': 'Omen Health Database API'
  },
  'basePath': '/',
  'schemes': [],
  'paths': {},
  'definitions': {}
}

let path_template = JSON.stringify({
  'tags': [],
  'summary': '',
  'description': '',
  'operationId': '',
  'consumes': [],
  'produces': [],
  'parameters': [],
  'responses': {}
})

let definition = JSON.stringify({
  'type': '',
  'properties': {

  }
})

let body_template = JSON.stringify({
  'in': '',
  'name': '',
  'required': '',
  'schema': {
    '$ref': '#/definitions/'
  }
})

let params_template = JSON.stringify({
  'in': '',
  'name': '',
  'required': '',
  'type': 'string'
})

const createPath = (path) => {
  let newPath = '';
  path.forEach(subPath => {
    if (subPath !== "")
      newPath = `${newPath}/${subPath}`
  })
  return newPath;
}

const generateParams = (body, name) => {
  switch (body.mode) {
    case 'formdata':
      return buildFormData(body.formdata)
    case 'raw':
      if (body.raw === "")
        return undefined
      return buildRaw(body.raw, name)
    default:
      return undefined
  }
}

const buildFormData = (formdata) => {
  let params = []
  formdata.forEach(form => {
    let param = JSON.parse(params_template);
    param.in = 'formData';
    param.name = form.key;
    param.required = (!form.disabled) ? true : false;
    params.push(param);
  })
  return params;
}

const buildRaw = (rawData, name) => {
  let params = []
  let param = JSON.parse(body_template);
  rawData = JSON.parse(rawData);
  param.in = 'body'
  param.name = 'body'
  param.required = (!rawData.__required || rawData.__required === true) ? true : false;


  param.schema.$ref = param.schema.$ref.concat(name)
  createDefinition(swagger.definitions, name, rawData, typeof rawData)

  params.push(param)

  return params
}

const createDefinition = (path, name, value, type, childOfArray) => {
  if (childOfArray) {
    path.type = 'object'
    path.properties = {}
    Object.keys(value).forEach((key, index) => {
      let item = value[key];

      path.properties[key] = {}
      if (typeof item === 'object')
        createDefinition(path.properties, key, item, typeof item);
      else
        createDefinition(path.properties[key], key, item, typeof item);
    })
  } else {
    if (!path[name])
      path[name] = {}
    if (Array.isArray(value)) {
      path[name].type = 'array'
      path[name].items = {}
      createDefinition(path[name].items, name, value[0], typeof value[0], true);
    } else
      switch (type) {
        case 'number':
          delete path[name]
          path.type = 'number'
          path.example = value
          break;
        case 'string':
          delete path[name]
          path.type = 'string'
          path.example = value
          break;

        case 'object':
          path[name].type = 'object'
          path[name].properties = {}
          Object.keys(value).forEach((key, index) => {
            let item = value[key];

            path[name].properties[key] = {}
            if (typeof item === 'object')
              createDefinition(path[name].properties, key, item, typeof item);
            else
              createDefinition(path[name].properties[key], key, item, typeof item);
          })
          break;
        default:
          console.log(type);
      }
  }
}

const createResponses = (method, responses) => {
  if (responses.length === 0)
    method[200] = {
      'description': 'ok',
    }

  else

    responses.forEach(response => {
      let body = JSON.parse(response.body)
      if (Array.isArray(body)) {
        method[response.code] = {
          'description': response.status,
          'schema': {
            'type': 'array',
            'items': {
              '$ref': `#/definitions/${response.name}_resp`
            }
          }
        }
        createDefinition(swagger.definitions, `${response.name}_resp`, body[0], typeof body[0])
      } else {
        method[response.code] = {
          'description': response.status,
          'schema': {
            '$ref': `#/definitions/${response.name}_resp`
          }
        }

        createDefinition(swagger.definitions, `${response.name}_resp`, body, typeof body)
      }
    })
}


const main = (() => {

  let input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  swagger.info.description = input.info.description;
  swagger.info.title = input.info.name;

  if (swagger.info.description === undefined)
    delete swagger.info.description
  if (swagger.info.title === undefined)
    delete swagger.info.title
  input.item.forEach(path => {
    path.item.forEach(req => {
      let subAux = req.request.url.path || [' ']
      newPath = createPath(subAux);
      if (!swagger.paths[newPath])
        swagger.paths[newPath] = {}
      let method = JSON.parse(path_template)
      method.tags = [path.name];
      method.summary = req.request.description;
      method.operationId = req.name;
      if (req.request.header.length != 0)
        method.consumes = [req.request.header[0].value];

      if (swagger.schemes.indexOf(req.request.url.protocol) === -1)
        swagger.schemes.push(req.request.url.protocol)


      let name = `${subAux.join('_')}_${req.request.method}`
      if (req.request.body.mode === 'formdata')
        method.consumes.push('multipart/form-data')
      method.parameters = generateParams(req.request.body, name)

      createResponses(method.responses, req.response)



      if (method.parameters === undefined)
        delete method.parameters
      if (method.consumes.length === 0)
        delete method.consumes
      if (method.summary === undefined)
        delete method.summary
      if (method.produces.length === 0)
        method.produces.push('application/json')
      if (Object.keys(method.responses).length === 0)
        console.error('No Responses Found');

      swagger.paths[newPath][req.request.method.toLowerCase()] = method

    })
  })

  yaml('RAPI_Docs.yml', swagger, function(err) {
    // do stuff with err
  });
})()
