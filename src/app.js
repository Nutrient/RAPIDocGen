const yaml = require('write-yaml');
const fs = require('fs');

const body_template = require('./templates/body').template;
const params_template = require('./templates/params').template;
const definition_template = require('./templates/definition').template;
const path_template = require('./templates/path').template;

const createPath = require('./auxFunctions/pathManipulation').createPath;


const filename = process.argv[3] || 'RAPI_Docs.yml'
const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

let swagger = {
  'swagger': '2.0',
  'info': {
    'version': '1.0.0'
  },
  'basePath': '/',
  'schemes': [],
  'paths': {},
  'definitions': {}
}

const buildFormData = formdata => {
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
  delete rawData.__required
  param.schema.$ref = param.schema.$ref.concat(name)
  createDefinition(swagger.definitions, name, rawData)
  params.push(param);
  return params;
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
};


const createResponses = (method, responses) => {
  if (responses.length === 0)
    method[200] = {
      'description': 'ok',
    }
  else
    responses.forEach(response => {
      let body;
      try {
        body = JSON.parse(response.body)
      } catch (err) {
        method[response.code] = {
          'description': response.body
        }
        return;

      }
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
        createDefinition(swagger.definitions, `${response.name}_resp`, body[0])
      } else {
        method[response.code] = {
          'description': response.status,
          'schema': {
            '$ref': `#/definitions/${response.name}_resp`
          }
        }
        createDefinition(swagger.definitions, `${response.name}_resp`, body)
      }
    })
}


const createDefinition = (path, name, value) => {
  const type = (Array.isArray(value)) ? 'array' : typeof value;
  switch (type) {
    case 'boolean':
      path.type = 'boolean'
      path.example = value
      break;
    case 'number':
      path.type = 'number'
      path.example = value
      break;
    case 'string':
      path.type = 'string'
      path.example = value
      break;
    case 'array':
      path[name] = {};
      path[name].type = 'array';
      path[name].items = {};
      createDefinition(path[name].items, '', value[0]);
      break;
    case 'object':
      // newPath = (name === '') ? path : path[name]
      let newPath = {};
      newPath.type = 'object';
      newPath.properties = {};
      Object.keys(value).forEach((key, index) => {
        newPath.properties[key] = {};
        if (typeof value[key] === 'object')
          createDefinition(newPath.properties, key, value[key]);
        else
          createDefinition(newPath.properties[key], key, value[key]);
      })
      if (name === '')
        path = newPath;
      else
        path[name] = newPath;
      break;
    case 'undefined':
      path.type = 'string'
      break;
    default:
      console.log('Missing Case for type: ', type);
  }
}


exports.main = (() => {
  if (input.info.description !== undefined)
    swagger.info.description = input.info.description;
  if (input.info.name !== undefined)
    swagger.info.title = input.info.name;

  input.item.forEach(path => {
    path.item.forEach(req => {
      let subAux = req.request.url.path || [' '];
      let newPath = createPath(subAux);
      if (!swagger.paths[newPath])
        swagger.paths[newPath] = {}
      let method = JSON.parse(path_template)

      method.tags = [path.name];
      method.summary = req.request.description;
      method.operationId = req.name;
      if (req.request.header.length != 0)
        method.consumes = [req.request.header[0].value];
      if (swagger.schemes.indexOf(req.request.url.protocol) === -1 && req.request.url.protocol != undefined)
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
  yaml(filename, swagger, err => {});
});
