module.exports = createDefinition = (path, name, value) => {
  const type = (Array.isArray(value)) ? 'array' : typeof value;
  switch (type) {
    case 'boolean':
      path.type = 'boolean';
      path.example = value;
      break;
    case 'number':
      path.type = 'number';
      path.example = value;
      break;
    case 'string':
      path.type = 'string';
      path.example = value;
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
      path.type = 'string';
      break;
    default:
      console.log('Missing Case for type: ', type);
  }
}
