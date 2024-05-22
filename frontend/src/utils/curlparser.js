import { parse } from 'shell-quote';
import { URL } from 'url';

let requestCount = 1;

const SUPPORTED_ARGS = [
  'url',
  'u',
  'user',
  'header',
  'H',
  'cookie',
  'b',
  'get',
  'G',
  'd',
  'data',
  'data-raw',
  'data-urlencode',
  'data-binary',
  'data-ascii',
  'form',
  'F',
  'request',
  'X',
];

const importCommand = (parseEntries) => {
  const pairsByName = {};
  const singletons = [];

  for (let i = 1; i < parseEntries.length; i++) {
    let parseEntry = parseEntries[i];
    if (typeof parseEntry === 'string') {
      parseEntry = parseEntry.trim();
    }

    if (typeof parseEntry === 'string' && parseEntry.match(/^-{1,2}[\w-]+/)) {
      const isSingleDash = parseEntry[0] === '-' && parseEntry[1] !== '-';
      let name = parseEntry.replace(/^-{1,2}/, '');

      if (!SUPPORTED_ARGS.includes(name)) {
        continue;
      }

      let value;
      const nextEntry = parseEntries[i + 1];
      if (isSingleDash && name.length > 1) {
        value = name.slice(1);
        name = name.slice(0, 1);
      } else if (typeof nextEntry === 'string' && !nextEntry.startsWith('-')) {
        value = nextEntry;
        i++;
      } else {
        value = true;
      }

      if (!pairsByName[name]) {
        pairsByName[name] = [value];
      } else {
        pairsByName[name].push(value);
      }
    } else if (parseEntry) {
      singletons.push(parseEntry);
    }
  }

  let parameters = [];
  let url = '';

  try {
    const urlValue = getPairValue(pairsByName, singletons[0] || '', ['url']);
    const { searchParams, href, search } = new URL(urlValue);
    parameters = Array.from(searchParams.entries()).map(([name, value]) => ({
      name,
      value,
      disabled: false,
    }));

    url = href.replace(search, '').replace(/\/$/, '');
  } catch (error) {}

  const [username, password] = getPairValue(pairsByName, '', ['u', 'user']).split(/:(.*)$/);

  const authentication = username
    ? {
      username: username.trim(),
      password: password.trim(),
    }
    : {};

  const headers = [
    ...((pairsByName.header || [])),
    ...((pairsByName.H || [])),
  ].map(header => {
    const [name, value] = header.split(/:(.*)$/);
    if (!value) {
      return {
        name: name.trim().replace(/;$/, ''),
        value: '',
      };
    }
    return {
      name: name.trim(),
      value: value.trim(),
    };
  });

  const cookieHeaderValue = [
    ...((pairsByName.cookie || [])),
    ...((pairsByName.b || [])),
  ]
    .map(str => {
      const name = str.split('=', 1)[0];
      const value = str.replace(`${name}=`, '');
      return `${name}=${value}`;
    })
    .join('; ');

  const existingCookieHeader = headers.find(
    header => header.name.toLowerCase() === 'cookie',
  );

  if (cookieHeaderValue && existingCookieHeader) {
    existingCookieHeader.value += `; ${cookieHeaderValue}`;
  } else if (cookieHeaderValue) {
    headers.push({
      name: 'Cookie',
      value: cookieHeaderValue,
    });
  }

  const dataParameters = pairsToDataParameters(pairsByName);
  const contentTypeHeader = headers.find(
    header => header.name.toLowerCase() === 'content-type',
  );
  const mimeType = contentTypeHeader
    ? contentTypeHeader.value.split(';')[0]
    : null;

  const formDataParams = [
    ...((pairsByName.form || [])),
    ...((pairsByName.F || [])),
  ].map(str => {
    const [name, value] = str.split('=');
    const item = {
      name,
    };

    if (value.indexOf('@') === 0) {
      item.fileName = value.slice(1);
      item.type = 'file';
    } else {
      item.value = value;
      item.type = 'text';
    }

    return item;
  });

  let body = {};
  const bodyAsGET = getPairValue(pairsByName, false, ['G', 'get']);

  if (dataParameters.length !== 0 && bodyAsGET) {
    parameters.push(...dataParameters);
  } else if (dataParameters && mimeType === 'application/x-www-form-urlencoded') {
    body = {
      mimeType,
      params: dataParameters.map(parameter => ({
        ...parameter,
        name: decodeURIComponent(parameter.name || ''),
        value: decodeURIComponent(parameter.value || ''),
      })),
    };

  } else if (dataParameters.length !== 0) {
    body = {
      text: dataParameters.map(parameter => `${parameter.name}${parameter.value}`).join('&'),
      mimeType: mimeType || '',
    };
  } else if (formDataParams.length) {
    body = {
      params: formDataParams,
      mimeType: mimeType || 'multipart/form-data',
    };
  }

  let method = getPairValue(pairsByName, '__UNSET__', [
    'X',
    'request',
  ]).toUpperCase();

  if (method === '__UNSET__' && body) {
    method = ('text' in body || 'params' in body) ? 'POST' : 'GET';
  }

  const count = requestCount++;
  return {
    _type: 'request',
    name: url || `cURL Import ${count}`,
    parameters,
    url,
    method,
    headers,
    authentication,
    body,
  };
};

const dataFlags = [
  'd',
  'data',
  'data-raw',
  'data-urlencode',
  'data-binary',
  'data-ascii',
];

const pairsToDataParameters = (keyedPairs) => {
  let dataParameters = [];

  for (const flagName of dataFlags) {
    const pairs = keyedPairs[flagName];

    if (!pairs || pairs.length === 0) {
      continue;
    }

    switch (flagName) {
      case 'd':
      case 'data':
      case 'data-ascii':
      case 'data-binary':
        dataParameters = dataParameters.concat(pairs.flatMap(pair => pairToParameters(pair, true)));
        break;
      case 'data-raw':
        dataParameters = dataParameters.concat(pairs.flatMap(pair => pairToParameters(pair)));
        break;
      case 'data-urlencode':
        dataParameters = dataParameters.concat(pairs.flatMap(pair => pairToParameters(pair, true))
          .map(parameter => {
            if (parameter.type === 'file') {
              return parameter;
            }

            return {
              ...parameter,
              value: encodeURIComponent(parameter.value ?? ''),
            };
          }));
        break;
      default:
        throw new Error(`unhandled data flag ${flagName}`);
    }
  }

  return dataParameters;
};

const pairToParameters = (pair, allowFiles = false) => {
  if (typeof pair === 'boolean') {
    return [{ name: '', value: pair.toString() }];
  }

  return pair.split('&').map(pair => {
    if (pair.includes('@') && allowFiles) {
      const [name, fileName] = pair.split('@');
      return { name, fileName, type: 'file' };
    }

    const [name, value] = pair.split('=');
    if (!value && !pair.includes('=')) {
      return { name: '', value: pair };
    }

    return { name, value };
  });
};

const getPairValue = (parisByName, defaultValue, names) => {
  for (const name of names) {
    if (parisByName[name] && parisByName[name].length) {
      return parisByName[name][0];
    }
  }

  return defaultValue;
};

const convert = (rawData) => {
  requestCount = 1;

  if (!rawData.match(/^\s*curl /)) {
    return null;
  }

  const parseEntries = parse(rawData.replace(/\n/g, ' '));

  const commands = [];
  let currentCommand = [];

  for (const parseEntry of parseEntries) {
    if (typeof parseEntry === 'string') {
      if (parseEntry.startsWith('$')) {
        currentCommand.push(parseEntry.slice(1, Infinity));
      } else {
        currentCommand.push(parseEntry);
      }
      continue;
    }

    if ((parseEntry).comment) {
      continue;
    }

    const { op } = parseEntry;
    if (op === ';') {
      commands.push(currentCommand);
      currentCommand = [];
      continue;
    }

    if (op?.startsWith('$')) {
      const str = op.slice(2, op.length - 1).replace(/\\'/g, "'");
      currentCommand.push(str);
      continue;
    }

    if (op === 'glob') {
      currentCommand.push(
        (parseEntry).pattern,
      );
      continue;
    }
  }

  commands.push(currentCommand);

  const requests = commands
    .filter(command => command[0] === 'curl')
    .map(importCommand);

  return requests;
};

export { convert };