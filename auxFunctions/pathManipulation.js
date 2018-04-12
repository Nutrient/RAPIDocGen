module.exports.createPath = (path) => {
  let newPath = '';
  path.forEach(subPath => {
    if (subPath !== "")
      newPath = `${newPath}/${subPath}`
  })
  return newPath.replace('{{','{').replace('}}','}');
};
