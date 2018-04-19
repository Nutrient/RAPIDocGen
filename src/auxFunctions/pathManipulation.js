const params_template = require('../templates/params');

module.exports.createPath = (path, method) => {
  let newPath = '';
  if(path[0] === '')
    return '/'

  path.forEach(subPath => {

    if(subPath.includes('{{')){
      let param = JSON.parse(params_template);
      param.in = 'path';
      param.name = subPath.replace('{{','').replace('}}','');
      param.required = true;
      param.type = 'string';
      method.parameters = method.parameters.concat([param]);

    }
    if (subPath !== '')
      newPath = `${newPath}/${subPath}`
  })
  return newPath.split('{{').join('');
};
