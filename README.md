# Backend Developer Intern Code Test

**Objective:** Create a URL shortener backend using Nest.js

## Requirements:

1. The shortened link must be unique and have an expiration of 5 years.
2. The system should implement authentication guard with email password using jwt token for creating token.
3. Allow the user to customize the URL with a maximum of 16 characters.
4. The system-generated short URL should be 6 characters.
5. The system should not have any downtime and must operate as fast as possible.
6. The system should effectively handle thousands of requests per second for generating unique short URLs.

## Instructions:

1. Provide a RESTful API to shorten a given URL.
2. The API should return the shortened URL and its expiration date.
3. Implement a redirection service that, when a user accesses the shortened URL, redirects to the original URL.
4. Include rate-limiting to prevent abuse.
5. Implement unit tests to test the functionality of your service.
6. Document your API endpoints and include a README file with setup instructions.
7. Document the API using Postman or Swagger.

## Evaluation:

Your solution will be evaluated based on the following criteria:

- Code quality and organization
- Adherence to the project requirements
- Use of best practices for API design and security
- Efficiency of the implemented solution
- Completeness of the tests and documentation
- Use of caching mechanisms is considered a plus point
- Using a migration file for MySQL is considered a plus point

## Submission Instructions

- Clone the provided GitHub repository to your personal account. After you have completed the test, send your code to effendy@evore.id, including setup instructions for the project in the README file.
- Ensure your submission is submitted within a maximum of 4 days after you receive the email.