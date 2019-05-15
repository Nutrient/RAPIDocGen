const yaml = require('write-yaml');
const fs = require('fs');

const body_template = require('./templates/body');
const params_template = require('./templates/params');
const definition_template = require('./templates/definition');
const path_template = require('./templates/path');
const swagger_template = require('./templates/swagger');

const createPath = require('./auxFunctions/pathManipulation').createPath;
const generateParams = require('./auxFunctions/paramsManipulation').generateParams;
const generateResponses = require('./auxFunctions/paramsManipulation').generateResponses;


const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const output = process.argv[3] || 'RAPI_Docs.yml';


exports.main = (() => {
	const swagger = JSON.parse(swagger_template);
	if (input.info.description !== undefined)
		swagger.info.description = input.info.description;
	if (input.info.name !== undefined)
		swagger.info.title = input.info.name;

	input.item.forEach(path => {
		if(path.item !== undefined)
			path.item.forEach(req => {
				const method = JSON.parse(path_template);
				const subAux = req.request.url.path || [' '];
				const newPath = createPath(subAux, method);
				const name = `${subAux.join('_')}_${req.request.method}`;

				method.tags = [path.name];
				method.summary = req.request.description;
				method.operationId = req.name;


				if (!swagger.paths[newPath])
					swagger.paths[newPath] = {};
				if (req.request.header.length != 0)
					req.request.header.forEach(header => {
						if(header.key === 'Accept') {
							method.consumes.push(header.value);
						}
					});
				if (swagger.schemes.indexOf(req.request.url.protocol) === -1 && req.request.url.protocol != undefined)
					swagger.schemes.push(req.request.url.protocol);
				if (req.request.body.mode === 'formdata')
					method.consumes.push('multipart/form-data');

				generateParams(req.request.body, name, swagger, method);
				generateResponses(method.responses, req.response, swagger);

				if (method.parameters.length === 0)
					delete method.parameters;
				if (method.consumes.length === 0)
					delete method.consumes;
				if (method.summary === undefined)
					delete method.summary;
				if (method.produces.length === 0)
					method.produces.push('application/json');
				if (Object.keys(method.responses).length === 0)
					console.error('No Responses Found');
				swagger.paths[newPath][req.request.method.toLowerCase()] = method;


			});
	});
	yaml(output, swagger, (err) => {});
});
