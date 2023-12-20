import axios from 'axios';

const DESTINATIONS = [
  {
    name: 'destination1',
    url: 'http://example.com/endpoint',
    transport: 'http.post'
  },
  {
    name: 'destination2',
    url: 'http://example2.com/endpoint',
    transport: 'http.put'
  },
  {
    name: 'destination3',
    url: 'http://example3.com/endpoint',
    transport: 'http.get'
  },
  {
    name: 'destination4',
    transport: 'console.log'
  }
];

const checkStrategy = function (strategy, destinationObj) {
  const deserializedFunction = eval(`(${strategy})`);
  
  if (typeof deserializedFunction === 'function') {
    return deserializedFunction();
  }
  
  if (strategy === 'ANY') {
    return Object.values(destinationObj).some(isDestinationPermitted => isDestinationPermitted);
  }
  
  if (strategy === 'ALL') {
    return Object.values(destinationObj).every(isDestinationPermitted => isDestinationPermitted);
  }
  
  return false;
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
  console.log(destinationConfig);
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
      method: console[method](name, payload),
    }
  }
}

const routeRequestsToDestinations = async function({ possibleDestinations, payload, strategy }) {
  const requests = {
    http: {},
    console: {
    },
  };
  
  possibleDestinations.forEach((destinationObj) => {
      const isRoutingToDestinationPermitted = checkStrategy(strategy, destinationObj)
      
      for (const destination in destinationObj) {
        if (isRoutingToDestinationPermitted) {
          const destinationConfig = DESTINATIONS.find(dest => dest.name === destination);
          
          if (destinationConfig) {
            const { protocol, method } = filterRequestsByRequestProtocol(destinationConfig, payload);
            
            requests[protocol] = method;
          } else {
            console.error('UnknownDestinationError', destination);
          }
        }
      }
    });
  
  const filteredRequests = Object.values(requests['http']);
  
  await Promise.allSettled(filteredRequests);
}

const requestRouter = async (req, res, next) => {
  try {
    const { possibleDestinations, payload, strategy = 'ALL'} = req.body;
    await routeRequestsToDestinations({ possibleDestinations, payload, strategy });
    res.send('processed');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      res.status(404).send('Not Found');
    } else {
      next(error);
    }
  }
}

export default requestRouter
