module.exports.createPath = (path) => {
  let newPath = '';
  if(path[0] === '')
    return '/'
  path.forEach(subPath => {
    if (subPath !== '')
      newPath = `${newPath}/${subPath}`
  })
  return newPath.replace('{{','{').replace('}}','}');
};
