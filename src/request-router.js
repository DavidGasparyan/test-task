import axios from 'axios';
import {Destinations} from "./constants/destinations.js";

const getAllPossibleDestinationsHashTable = function(possibleDestinations) {
  return Array.from(
    new Set(possibleDestinations.flatMap(obj => Object.keys(obj)))
  ).reduce((a, v) => ({ ...a, [v]: false}), {})
}

const filterDestinationsByStrategy = function (strategy, possibleDestinations) {
  const allDestinationKeys = Array.from(
    new Set(possibleDestinations.flatMap(obj => Object.keys(obj)))
  );
  
  if (strategy === 'ANY') {
    return allDestinationKeys.filter(key =>
      possibleDestinations.some(obj => obj[key] === true)
    );
  }
  
  if (strategy === 'ALL') {
    return allDestinationKeys.filter(key =>
      possibleDestinations.every(obj => obj[key] === true || obj[key] === undefined)
    );
  }

  const deserializedFunction = eval(`(${strategy})`);

  if (typeof deserializedFunction === 'function') {
    return allDestinationKeys.filter(key =>
      possibleDestinations.every(deserializedFunction)
    );
  }
  
  return allDestinationKeys;
}

const getRequestByHttpMethod = function(method, url, payload) {
  if (method === 'post' || method === 'put' || method === 'patch') {
    return axios.create({
      method: method,
      url: url,
      data: payload
    });
  }
  
  return axios.create({
    method: method,
    url: url,
  });
}


const filterRequestsByRequestProtocol = function(destinationConfig, payload) {
  const { transport, url, name } = destinationConfig
  const [ protocol, method ] = transport.split('.');
  
  if (protocol === 'http') {
    return {
      protocol,
      method: getRequestByHttpMethod(method, url, payload),
    }
  }
  
  if (protocol === 'console') {
    return {
      protocol: 'console',
      method: () => console[method](name, payload),
    }
  }
}

const routeRequestsToDestinations = async function({ possibleDestinations, payload, strategy }) {
  const requests = {
    http: {},
    console: {},
  };
  
  const allDestinations = getAllPossibleDestinationsHashTable(possibleDestinations);
  
  const filteredDestinations = filterDestinationsByStrategy(strategy, possibleDestinations);
  
  filteredDestinations.forEach((destination) => {
    const destinationConfig = Destinations.find(dest => dest.name === destination);
    
    if (destinationConfig) {
      const { protocol, method } = filterRequestsByRequestProtocol(destinationConfig, payload);
      requests[protocol][destination] = method;
    } else {
      console.error('UnknownDestinationError', destination);
    }
  });
  
  const httpRequests = Object.values(requests['http']);

  await Promise.allSettled(httpRequests);

  for (let fn in requests['console']) {
    requests['console'][fn]();
  }

  return {
    ...allDestinations,
    ...(Object.keys(requests['http']).reduce((a, v) => ({ ...a, [v]: true}), {})),
    ...(Object.keys(requests['console']).reduce((a, v) => ({ ...a, [v]: true}), {})),
  }
}

const requestRouter = async (req, res, next) => {
  try {
    const { possibleDestinations, payload, strategy = 'ALL'} = req.body;
    const response = await routeRequestsToDestinations({ possibleDestinations, payload, strategy });
    res.send(response);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      res.status(404).send('Not Found');
    } else {
      next(error);
    }
  }
}

export default requestRouter
