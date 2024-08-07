const httpErrors = {
    BAD_REQUEST: {
      code: 400,
      message: 'Bad Request'
    },
    UNAUTHORIZED: {
      code: 401,
      message: 'Unauthorized'
    },
    FORBIDDEN: {
      code: 403,
      message: 'Forbidden'
    },
    NOT_FOUND: {
      code: 404,
      message: 'Not Found'
    },
    INTERNAL_SERVER_ERROR: {
      code: 500,
      message: 'Internal Server Error'
    },
    WRONG_DURATION:{
      code: 400,
      message: 'The duration must be at least 10 minutes.'
    }
  };
  
  export default httpErrors;
  