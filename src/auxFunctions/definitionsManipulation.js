module.exports = createDefinition = (path, name, value, nested = false) => {
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
		createDefinition(path[name].items, '', value[0], true);
		break;
	case 'object':
		// newPath = (name === '') ? path : path[name]
		const newPath = {};
		newPath.type = 'object';
		newPath.properties = {};
		try {
			Object.keys(value).forEach((key, index) => {
				newPath.properties[key] = {};
				if (Array.isArray(value[key])){
					newPath.properties[key].type = 'array';
					newPath.properties[key].items = {};
					if (typeof value[key][0] === 'object') {
						createDefinition(newPath.properties[key].items, key, value[key][0], true);
					}
					else {
						createDefinition(newPath.properties[key].items, '', value[key][0]);
					}
				}			
				else if (typeof value[key] === 'object')
					createDefinition(newPath.properties, key, value[key]);
				else
					createDefinition(newPath.properties[key], key, value[key]);
			});
		} catch (error) {
			console.log('error', name, value, "values will be set to empty object");
		}

		
		if (name === '')
			path = newPath;
		else if(nested) {
			path['type'] = 'object';
			path['properties'] = newPath.properties;
		}
		else
			path[name] = newPath;
		break;
	case 'undefined':
		path.type = 'string';
		break;
	default:
		console.log('Missing Case for type: ', type);
	}
};
