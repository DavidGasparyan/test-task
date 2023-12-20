import Joi from 'joi';

const validateRoutingEventRequestBody = (req, res, next) => {
  const schema = Joi.object({
    possibleDestinations: Joi.array().items(
      Joi.object().pattern(/^destination/, Joi.boolean())
    ).required(),
    payload: Joi.object().required(),
    strategy: Joi.string().optional(),
  });
  
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details.map((detail) => detail.message) });
  }
  
  next();
};

export default validateRoutingEventRequestBody
