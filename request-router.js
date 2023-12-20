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

// http -> axios controller
// console -> console controller
// GRPc -> message broker

/*
  {
    payload: ***
    possibleDestinations: ***
    strategy: ***
  }
 */

function checkStrategy(strategy, destinationObj) {
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

const requestRouter = async (req, res, next) => {
  try {
    const requests = {};
    const { possibleDestinations, payload, strategy = 'ALL'} = req.body;
    
    possibleDestinations
      .forEach((destinationObj) => {
        const isRoutingToDestinationPermitted = checkStrategy(strategy, destinationObj)
        
        for (const destination in destinationObj) {
          if (isRoutingToDestinationPermitted) {
            const destinationConfig = DESTINATIONS.find(dest => dest.name === destination);
            
            if (destinationConfig) {
              const { transport, url, name} = destinationConfig
              const [ protocol, method] = transport.split('.');
              
              if (protocol === 'http') {
                let promise;
                
                if (method === 'post' || method === 'put' || method === 'patch') {
                  promise = axios.create({
                    method: method,
                    url: url,
                    data: payload
                  });
                } else {
                  promise = axios.create({
                    method: method,
                    url: url,
                  });
                }
                
                requests[destination] = promise;
              }
              
              if (protocol === 'console') {
                console[method](destination, payload);
              }
            } else {
              console.error('UnknownDestinationError', destination);
            }
          }
        }
      });
    
    const filteredRequests = Object.values(requests);
    const response = await Promise.allSettled(filteredRequests);
    
    // console.log(response);
    
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
