const createDefinition = require('./definitionsManipulation');
const body_template = require('../templates/body');
const params_template = require('../templates/params');

const buildFormData = (formdata) => {
  let params = [];
  formdata.forEach(form => {
    let param = JSON.parse(params_template);
    param.in = 'formData';
    param.name = form.key;
    param.required = (!form.disabled) ? true : false;
    params.push(param);
  });
  return params;
};

const buildRaw = (rawData, name, swagger) => {
  let params = [];
  let param = JSON.parse(body_template);
  rawData = JSON.parse(rawData);
  param.in = 'body';
  param.name = 'body';
  param.required = (!rawData.__required || rawData.__required === true) ? true : false;
  delete rawData.__required;
  param.schema.$ref = param.schema.$ref.concat(name);
  createDefinition(swagger.definitions, name, rawData);
  params.push(param);
  return params;
};

module.exports.generateParams = (body, name, swagger, method) => {
  switch (body.mode) {
    case 'formdata':
      method.parameters = buildFormData(body.formdata);
      break;
    case 'raw':
      if (body.raw === ""){
        method.parameters = undefined;
        break;
      }
      method.parameters = buildRaw(body.raw, name, swagger);
      break;
    default:
      method.parameters = undefined;
  };
};

module.exports.generateResponses = (method, responses, swagger) => {
  if (responses.length === 0)
    method[200] = {
      'description': 'ok',
    };
  else
    responses.forEach(response => {
      let body;
      try {
        body = JSON.parse(response.body);
      } catch (err) {
        method[response.code] = {
          'description': response.body
        };
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
        };
        createDefinition(swagger.definitions, `${response.name}_resp`, body[0]);
      } else {
        method[response.code] = {
          'description': response.status,
          'schema': {
            '$ref': `#/definitions/${response.name}_resp`
          }
        };
        createDefinition(swagger.definitions, `${response.name}_resp`, body);
      }
    });
};